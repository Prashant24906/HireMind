"""
RecruitAI ML Service — FastAPI entry point.

Receives candidate interview answers from the Express backend (port 5000),
scores them via LLM, and returns structured JSON scores.
Also generates interview questions with MCQ and theory options.
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
    description="Scores candidate interview answers, generates questions (MCQ + Theory), and more.",
    version="2.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

scorer = ScoringService()
question_gen = QuestionGenerator()

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


class QuestionGenerateRequest(BaseModel):
    job_title: str
    skills: list[str] = []
    difficulty: str = "medium"


class QuestionModel(BaseModel):
    id: int
    type: str  # "mcq" or "theory"
    question: str
    options: list[str] | None = None  # For MCQ
    correct_answer: str | None = None  # For MCQ
    expected_keywords: list[str] | None = None  # For Theory
    difficulty: str


class QuestionGenerateResponse(BaseModel):
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
        "version": "2.0.0",
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


@app.post("/generate-questions", response_model=QuestionGenerateResponse)
async def generate_questions(req: QuestionGenerateRequest):
    """
    Generate 10 interview questions for a job role.
    
    Returns 5 MCQ questions and 5 theory questions with difficulty progression.
    """
    questions_data = await question_gen.generate_questions(
        job_title=req.job_title,
        skills=req.skills,
        difficulty=req.difficulty,
    )
    return QuestionGenerateResponse(**questions_data)


# ──────────────────────────────────────────────
#  Info endpoint
# ──────────────────────────────────────────────


@app.get("/")
async def root():
    """Root endpoint - API info"""
    return {
        "name": "RecruitAI ML Service",
        "version": "2.0.0",
        "endpoints": {
            "health": "GET /health",
            "score": "POST /score",
            "followup": "POST /followup",
            "generate_questions": "POST /generate-questions",
            "docs": "GET /docs"
        }
    }


# ──────────────────────────────────────────────
#  Run with: python main.py
# ──────────────────────────────────────────────

if __name__ == "__main__":
    import uvicorn

    port = int(os.getenv("PORT", 8000))
    print(f"\n--- RecruitAI ML Service v2.0 starting on port {port} ---\n")
    print("✨ Features:")
    print("   ✓ Interview answer scoring")
    print("   ✓ Follow-up question generation")
    print("   ✓ Smart question generation (MCQ + Theory)")
    print("   ✓ NIKO Chatbot support")
    print("\n📚 API Docs: http://localhost:{}/docs\n".format(port))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
