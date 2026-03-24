"""
Enhanced Question Generator for HireMind
Generates 10 questions: 5 MCQ + 5 Theory with difficulty progression
"""

from groq import Groq
import json
import os


class QuestionGenerator:
    def __init__(self):
        self.client = Groq(api_key=os.getenv("GROQ_API_KEY"))
        self.model = "llama-3.1-8b-instant"

    async def generate_questions(self, job_title: str, skills: list[str], difficulty: str = "medium"):
        """
        Generate 10 interview questions for a specific job role
        
        Args:
            job_title: Position title (e.g., "ML Engineer")
            skills: List of required skills (e.g., ["Python", "TensorFlow"])
            difficulty: "easy", "medium", or "hard"
        
        Returns:
            JSON with 10 questions (5 MCQ + 5 Theory)
        """
        
        skills_str = ", ".join(skills) if skills else "general technical skills"
        
        prompt = f"""Generate exactly 10 interview questions for a {job_title} position.
Required skills: {skills_str}
Difficulty level: {difficulty}

Return ONLY valid JSON (no markdown, no extra text):
{{
  "questions": [
    {{
      "id": 1,
      "type": "mcq",
      "question": "Question text here?",
      "options": ["A) Option 1", "B) Option 2", "C) Option 3", "D) Option 4"],
      "correct_answer": "A",
      "difficulty": "easy"
    }},
    {{
      "id": 6,
      "type": "theory",
      "question": "Explain [concept]. Give a detailed answer.",
      "expected_keywords": ["keyword1", "keyword2", "keyword3"],
      "difficulty": "medium"
    }}
  ]
}}

REQUIREMENTS:
- Questions 1-5 MUST be MCQ type with 4 options each
- Questions 6-10 MUST be theory type with expected_keywords list
- Include 2 easy, 5 medium, 3 hard questions distributed throughout
- Questions should test conceptual understanding, practical application, and problem-solving
- Mix theory, coding concepts, system design, and best practices
- Make theory questions open-ended and requiring detailed explanations
- Each MCQ must have exactly one correct answer
- expected_keywords should be 3-5 key terms that should appear in a good answer

Return ONLY the JSON, nothing else."""

        try:
            message = self.client.messages.create(
                model=self.model,
                messages=[{"role": "user", "content": prompt}],
                temperature=0.7,
                max_tokens=3000,
            )
            
            response_text = message.content[0].text.strip()
            
            # Try to parse JSON
            try:
                # Clean up the response (remove markdown if present)
                if "```json" in response_text:
                    response_text = response_text.split("```json")[1].split("```")[0]
                elif "```" in response_text:
                    response_text = response_text.split("```")[1].split("```")[0]
                
                questions_data = json.loads(response_text)
                return questions_data
            except json.JSONDecodeError:
                # Fallback: return default questions
                return self._get_fallback_questions(job_title, difficulty)
                
        except Exception as e:
            print(f"Error generating questions: {str(e)}")
            return self._get_fallback_questions(job_title, difficulty)

    def _get_fallback_questions(self, job_title: str, difficulty: str):
        """Fallback questions if generation fails"""
        return {
            "questions": [
                {
                    "id": 1,
                    "type": "mcq",
                    "question": f"Which is a key skill for {job_title}?",
                    "options": ["A) Problem solving", "B) Creativity", "C) Communication", "D) All of above"],
                    "correct_answer": "D",
                    "difficulty": "easy"
                },
                {
                    "id": 2,
                    "type": "mcq",
                    "question": "What is important in software development?",
                    "options": ["A) Code quality", "B) Documentation", "C) Testing", "D) All of above"],
                    "correct_answer": "D",
                    "difficulty": "easy"
                },
                {
                    "id": 3,
                    "type": "mcq",
                    "question": "How do you approach complex problems?",
                    "options": ["A) Break into smaller parts", "B) Ask for help", "C) Research solutions", "D) All of above"],
                    "correct_answer": "D",
                    "difficulty": "medium"
                },
                {
                    "id": 4,
                    "type": "mcq",
                    "question": "What does clean code mean?",
                    "options": ["A) Readable", "B) Maintainable", "C) Efficient", "D) All of above"],
                    "correct_answer": "D",
                    "difficulty": "medium"
                },
                {
                    "id": 5,
                    "type": "mcq",
                    "question": "Why is version control important?",
                    "options": ["A) Track changes", "B) Collaboration", "C) History", "D) All of above"],
                    "correct_answer": "D",
                    "difficulty": "medium"
                },
                {
                    "id": 6,
                    "type": "theory",
                    "question": f"Explain the key responsibilities of a {job_title}. What skills matter most and why?",
                    "expected_keywords": ["responsibility", "skill", "technical", "soft skills", "problem solving"],
                    "difficulty": "medium"
                },
                {
                    "id": 7,
                    "type": "theory",
                    "question": "Describe your approach to learning new technologies. Give a real example.",
                    "expected_keywords": ["documentation", "practice", "project", "feedback", "iterate"],
                    "difficulty": "medium"
                },
                {
                    "id": 8,
                    "type": "theory",
                    "question": "How do you handle challenging situations in team projects?",
                    "expected_keywords": ["communication", "collaboration", "conflict", "solution", "team"],
                    "difficulty": "hard"
                },
                {
                    "id": 9,
                    "type": "theory",
                    "question": "What is your biggest strength and how would you apply it to this role?",
                    "expected_keywords": ["strength", "relevant", "example", "impact", "role"],
                    "difficulty": "medium"
                },
                {
                    "id": 10,
                    "type": "theory",
                    "question": "Describe a technical problem you solved. What was your approach?",
                    "expected_keywords": ["problem", "analysis", "solution", "result", "learning"],
                    "difficulty": "hard"
                }
            ]
        }
