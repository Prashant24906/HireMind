"""
Enhanced Question Generator for HireMind
Generates 10 questions: 5 MCQ + 5 Theory with difficulty progression.
Questions are tightly scoped to the job title, domain, and description.
"""

import json
import os
from groq import Groq


class QuestionGenerator:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-8b-instant"

    def _build_prompt(self, job_title: str, domain: str, skills: list, description: str, difficulty: str) -> str:
        skills_str = ", ".join(skills) if skills else "not specified"
        desc_snippet = description[:600].strip() if description else ""

        context_block = f"Job Title: {job_title}\nDomain: {domain}\nDifficulty: {difficulty}\n"
        if skills_str != "not specified":
            context_block += f"Required Skills: {skills_str}\n"
        if desc_snippet:
            context_block += f"Job Description (excerpt): {desc_snippet}\n"

        return f"""You are a senior technical interviewer. Generate exactly 10 interview questions for the following role.

{context_block}

STRICT RULES:
1. ALL questions MUST be directly relevant to the "{job_title}" role and the "{domain}" domain.
2. Do NOT generate generic questions about soft skills, teamwork, or learning habits.
3. Questions 1-5 MUST be MCQ (type="mcq") with 4 options labeled A), B), C), D).
4. Questions 6-10 MUST be open-ended theory questions (type="theory").
5. MCQ questions must test technical knowledge specific to {job_title} (tools, algorithms, concepts, syntax, architecture).
6. Theory questions should require detailed explanations of concepts, trade-offs, or design decisions relevant to {job_title}.
7. Difficulty distribution: 2 easy (q1,q6), 5 medium (q2,q3,q7,q8,q9), 3 hard (q4,q5,q10).
8. Return ONLY valid JSON — no markdown, no extra text, no backticks.

JSON format:
{{
  "questions": [
    {{
      "id": 1,
      "type": "mcq",
      "question": "<specific technical question for {job_title}>",
      "options": ["A) ...", "B) ...", "C) ...", "D) ..."],
      "correct_answer": "A",
      "difficulty": "easy"
    }},
    {{
      "id": 6,
      "type": "theory",
      "question": "<specific open-ended question for {job_title}>",
      "expected_keywords": ["keyword1", "keyword2", "keyword3"],
      "difficulty": "easy"
    }}
  ]
}}

Return ONLY the JSON object, nothing else."""

    async def generate_questions(
        self,
        job_title: str,
        domain: str = "general",
        skills: list = None,
        description: str = "",
        difficulty: str = "medium",
    ):
        """
        Generate 10 role-specific interview questions (5 MCQ + 5 Theory).

        Args:
            job_title:   Position title  (e.g. "ML Engineer")
            domain:      Job domain      (e.g. "mlai", "webdev")
            skills:      Required skills (e.g. ["Python", "TensorFlow"])
            description: Job description text for context extraction
            difficulty:  "easy" | "medium" | "hard"

        Returns:
            dict with key "questions" containing a list of question objects
        """
        if skills is None:
            skills = []

        prompt = self._build_prompt(job_title, domain, skills, description, difficulty)

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=3000,
            )

            response_text = response.choices[0].message.content.strip()

            # Strip markdown fences if present
            if "```json" in response_text:
                response_text = response_text.split("```json")[1].split("```")[0]
            elif "```" in response_text:
                response_text = response_text.split("```")[1].split("```")[0]

            # Isolate the JSON object
            start = response_text.find("{")
            end = response_text.rfind("}")
            if start != -1 and end != -1:
                response_text = response_text[start : end + 1]

            questions_data = json.loads(response_text)

            # Basic validation
            if "questions" not in questions_data or not isinstance(questions_data["questions"], list):
                raise ValueError("Invalid response structure")
            if len(questions_data["questions"]) == 0:
                raise ValueError("Empty questions list")

            print(f"[QuestionGenerator] Generated {len(questions_data['questions'])} questions for '{job_title}' ({domain})")
            return questions_data

        except json.JSONDecodeError as e:
            print(f"[QuestionGenerator] JSON parse error: {e} — using fallback")
            return self._get_fallback_questions(job_title, domain, difficulty)

        except Exception as e:
            print(f"[QuestionGenerator] Error generating questions: {e} — using fallback")
            return self._get_fallback_questions(job_title, domain, difficulty)

    def _get_fallback_questions(self, job_title: str, domain: str, difficulty: str):
        """Role-aware fallback questions used when LLM generation fails."""
        return {
            "questions": [
                {
                    "id": 1,
                    "type": "mcq",
                    "question": f"Which of the following is a core responsibility of a {job_title}?",
                    "options": [
                        "A) Managing HR operations",
                        "B) Designing and implementing domain-specific solutions",
                        "C) Handling financial audits",
                        "D) Overseeing legal compliance",
                    ],
                    "correct_answer": "B",
                    "difficulty": "easy",
                },
                {
                    "id": 2,
                    "type": "mcq",
                    "question": f"Which approach is most important when debugging issues in a {domain} system?",
                    "options": [
                        "A) Rewriting the entire codebase",
                        "B) Systematic isolation of the failing component and root-cause analysis",
                        "C) Ignoring edge cases",
                        "D) Deploying to production without testing",
                    ],
                    "correct_answer": "B",
                    "difficulty": "medium",
                },
                {
                    "id": 3,
                    "type": "mcq",
                    "question": "What is a key benefit of version control in software development?",
                    "options": [
                        "A) It eliminates all bugs automatically",
                        "B) It allows tracking of changes and collaboration across teams",
                        "C) It replaces documentation entirely",
                        "D) It speeds up hardware performance",
                    ],
                    "correct_answer": "B",
                    "difficulty": "medium",
                },
                {
                    "id": 4,
                    "type": "mcq",
                    "question": "Which of the following best describes a microservices architecture?",
                    "options": [
                        "A) A single large application handling all concerns",
                        "B) Multiple small, independently deployable services communicating via APIs",
                        "C) A monolithic database with replicated services",
                        "D) A hardware-level design pattern",
                    ],
                    "correct_answer": "B",
                    "difficulty": "hard",
                },
                {
                    "id": 5,
                    "type": "mcq",
                    "question": "What does 'scalability' mean in the context of system design?",
                    "options": [
                        "A) The system can handle increased load without degrading performance",
                        "B) The system uses the least possible memory",
                        "C) The system is only accessible by admins",
                        "D) The system never requires updates",
                    ],
                    "correct_answer": "A",
                    "difficulty": "hard",
                },
                {
                    "id": 6,
                    "type": "theory",
                    "question": f"Describe the key technical skills required for a {job_title} role and explain how they apply to real-world problems in the {domain} domain.",
                    "expected_keywords": ["technical", "skills", "domain", "apply", "problem"],
                    "difficulty": "easy",
                },
                {
                    "id": 7,
                    "type": "theory",
                    "question": f"Explain how you would design a solution for a complex {domain} problem. Walk through your thought process.",
                    "expected_keywords": ["design", "requirements", "architecture", "trade-offs", "solution"],
                    "difficulty": "medium",
                },
                {
                    "id": 8,
                    "type": "theory",
                    "question": "How do you ensure code quality and maintainability in your projects? Provide specific examples.",
                    "expected_keywords": ["testing", "code review", "documentation", "refactoring", "standards"],
                    "difficulty": "medium",
                },
                {
                    "id": 9,
                    "type": "theory",
                    "question": "Describe a situation where you had to optimize system performance. What metrics did you use and what changes did you make?",
                    "expected_keywords": ["performance", "metrics", "profiling", "optimization", "bottleneck"],
                    "difficulty": "medium",
                },
                {
                    "id": 10,
                    "type": "theory",
                    "question": f"What are the most challenging aspects of working as a {job_title} and how do you overcome them?",
                    "expected_keywords": ["challenges", "solution", "experience", "approach", "skills"],
                    "difficulty": "hard",
                },
            ]
        }
