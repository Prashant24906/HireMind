"""
ScoringService — Calls LLM (Groq or Gemini) to score candidate answers
and generate follow-up questions for weak responses.
"""

import os
import json
import re
from itertools import islice
from prompts import SCORING_SYSTEM_PROMPT, FOLLOWUP_SYSTEM_PROMPT  # type: ignore[import-not-found]


class ScoringService:
    """Handles LLM-based scoring and follow-up question generation."""

    def __init__(self):
        self.provider = os.getenv("PROVIDER", "groq").lower()

        if self.provider == "groq":
            from groq import Groq  # type: ignore[import-not-found]

            self.groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
            self.groq_model = "llama-3.1-8b-instant"
            print(f"[ScoringService] Initialized with Groq (model: {self.groq_model})")

        elif self.provider == "gemini":
            import google.generativeai as genai  # type: ignore[import-not-found]

            genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
            self.gemini_model = genai.GenerativeModel("gemini-pro")
            print("[ScoringService] Initialized with Gemini (model: gemini-pro)")

        else:
            raise ValueError(
                f"Unknown PROVIDER '{self.provider}'. Use 'groq' or 'gemini'."
            )

    # ──────────────────────────────────────────────
    #  Internal helpers
    # ──────────────────────────────────────────────

    def _strip_markdown_fences(self, text: str) -> str:
        """Remove ```json wrappers and any conversational padding outside the JSON."""
        # Find the first { and last } to isolate the JSON object
        start_idx = text.find("{")
        end_idx = text.rfind("}")
        
        if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
            return text[start_idx:end_idx + 1]
            
        return text.strip()

    @staticmethod
    def _truncate(text: str, length: int = 40) -> str:
        """Truncate text to the given length for logging."""
        return text if len(text) <= length else "".join(islice(text, length))

    def _validate_score_response(self, data: dict) -> dict:
        """Ensure all required keys exist in the scoring response."""
        required_breakdown_keys = [
            "accuracy",
            "depth",
            "clarity",
            "application",
            "critical",
        ]

        if "score" not in data or "breakdown" not in data or "reason" not in data:
            raise ValueError("Missing required top-level keys in LLM response")

        if not isinstance(data["breakdown"], dict):
            raise ValueError("'breakdown' must be a dict")

        for key in required_breakdown_keys:
            if key not in data["breakdown"]:
                raise ValueError(f"Missing breakdown key: {key}")

        return data

    async def _call_groq(
        self, system_prompt: str, user_message: str, max_tokens: int, temperature: float
    ) -> str:
        """Make a chat completion call to Groq."""
        response = self.groq_client.chat.completions.create(
            model=self.groq_model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_message},
            ],
            max_tokens=max_tokens,
            temperature=temperature,
        )
        return response.choices[0].message.content

    async def _call_gemini(
        self, system_prompt: str, user_message: str, max_tokens: int, temperature: float
    ) -> str:
        """Make a generate_content call to Gemini."""
        combined_prompt = f"{system_prompt}\n\n{user_message}"
        response = self.gemini_model.generate_content(
            combined_prompt,
            generation_config={
                "max_output_tokens": max_tokens,
                "temperature": temperature,
            },
        )
        return response.text

    async def _call_llm(
        self, system_prompt: str, user_message: str, max_tokens: int, temperature: float
    ) -> str:
        """Route to the configured provider."""
        if self.provider == "groq":
            return await self._call_groq(system_prompt, user_message, max_tokens, temperature)
        else:
            return await self._call_gemini(system_prompt, user_message, max_tokens, temperature)

    # ──────────────────────────────────────────────
    #  Public API
    # ──────────────────────────────────────────────

    async def score_answer(
        self, question: str, answer: str, domain: str, difficulty: str
    ) -> dict:
        """
        Score a candidate's answer using the LLM.

        Returns a dict with keys: score, breakdown, reason.
        On any failure, returns a safe fallback so the API never crashes.
        """
        user_message = (
            f"Question: {question}\n\n"
            f"Candidate's answer: {answer}\n\n"
            f"Domain: {domain}, Difficulty: {difficulty}"
        )

        try:
            raw = await self._call_llm(
                system_prompt=SCORING_SYSTEM_PROMPT,
                user_message=user_message,
                max_tokens=500,
                temperature=0.1,
            )

            cleaned = self._strip_markdown_fences(raw)
            data = json.loads(cleaned)
            result = self._validate_score_response(data)

            # Console log per spec
            q_preview = self._truncate(question)
            print(f"Scored: Q='{q_preview}...' Score={result['score']}")

            return result

        except json.JSONDecodeError:
            q_err = self._truncate(question)
            print(f"[ERROR] JSON parse failed for Q='{q_err}...'")
            return {
                "score": None,
                "breakdown": None,
                "reason": "Scoring failed - JSON parse error",
            }

        except Exception as exc:
            print(f"[ERROR] LLM call failed: {exc}")
            return {
                "score": None,
                "breakdown": None,
                "reason": "LLM service unavailable",
            }

    async def get_followup(
        self, question: str, answer: str, score: float
    ) -> str:
        """
        Generate a concise follow-up question for a weak answer.

        Returns plain-text question string. Falls back to a generic prompt on failure.
        """
        user_message = (
            f"Original question: {question}\n\n"
            f"Candidate answered: {answer}\n\n"
            f"Their score was: {score}/10"
        )

        try:
            raw = await self._call_llm(
                system_prompt=FOLLOWUP_SYSTEM_PROMPT,
                user_message=user_message,
                max_tokens=100,
                temperature=0.3,
            )
            return raw.strip()

        except Exception as exc:
            print(f"[ERROR] Follow-up generation failed: {exc}")
            return "Can you elaborate further on your answer?"
