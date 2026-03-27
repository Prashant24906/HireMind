"""
RecruitAI ML Service — FastAPI entry point.

Receives candidate interview answers from the Express backend (port 5000),
scores them via LLM, and returns structured JSON scores.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import os

# Load .env BEFORE importing scorer (scorer reads env vars in __init__)
load_dotenv()

from scorer import ScoringService  # noqa: E402
from question_generator import QuestionGenerator  # noqa: E402

# ──────────────────────────────────────────────
#  App & middleware
# ──────────────────────────────────────────────

app = FastAPI(
    title="RecruitAI ML Service",
    description="Scores candidate interview answers and generates follow-up questions.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scorer = ScoringService()
question_generator = QuestionGenerator()

# ──────────────────────────────────────────────
#  Pydantic models
# ──────────────────────────────────────────────


class ScoreRequest(BaseModel):
    question: str
    answer: str
    domain: str = "general"
    difficulty: str = "medium"


class BreakdownModel(BaseModel):
    accuracy: float | None = None
    depth: float | None = None
    clarity: float | None = None
    application: float | None = None
    critical: float | None = None


class ScoreResponse(BaseModel):
    score: float | None
    breakdown: BreakdownModel | None
    reason: str


class FollowUpRequest(BaseModel):
    question: str
    answer: str
    score: float


class FollowUpResponse(BaseModel):
    followUp: str


class GenerateQuestionsRequest(BaseModel):
    job_title: str
    domain: str = "general"
    skills: list[str] = []
    description: str = ""
    difficulty: str = "medium"


class GenerateQuestionsResponse(BaseModel):
    questions: list[dict]


# ──────────────────────────────────────────────
#  Endpoints
# ──────────────────────────────────────────────


@app.get("/health")
async def health_check():
    """Simple health-check endpoint for the Express backend to ping."""
    return {
        "status": "ok",
        "provider": os.getenv("PROVIDER", "groq"),
    }


@app.post("/score", response_model=ScoreResponse)
async def score_answer(req: ScoreRequest):
    """Score a candidate's answer and return structured breakdown."""
    result = await scorer.score_answer(
        question=req.question,
        answer=req.answer,
        domain=req.domain,
        difficulty=req.difficulty,
    )
    return ScoreResponse(**result)


@app.post("/followup", response_model=FollowUpResponse)
async def generate_followup(req: FollowUpRequest):
    """Generate a follow-up question for a weak answer."""
    followup_text = await scorer.get_followup(
        question=req.question,
        answer=req.answer,
        score=req.score,
    )
    return FollowUpResponse(followUp=followup_text)


@app.post("/generate-questions", response_model=GenerateQuestionsResponse)
async def generate_questions(req: GenerateQuestionsRequest):
    """Generate role-specific interview questions for a job posting."""
    result = await question_generator.generate_questions(
        job_title=req.job_title,
        domain=req.domain,
        skills=req.skills,
        description=req.description,
        difficulty=req.difficulty,
    )
    return GenerateQuestionsResponse(questions=result["questions"])


# ──────────────────────────────────────────────
#  Run with: python main.py
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    print(f"\n--- RecruitAI ML Service starting on port {port} ---\n")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
