# RecruitAI / HireMind

AI-driven recruitment interview platform for 4th-year college students.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express + MongoDB (Mongoose) |
| Auth | JWT (jsonwebtoken + bcryptjs) |
| State | Zustand |
| ML Service | FastAPI + OpenAI (separate developer) |

## Roles

- **Candidate** — Browse jobs, take AI-powered interviews, view results
- **Interviewer** — Post jobs, view ranked candidate results
- **Admin** — Platform stats, user management

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account (or local MongoDB)
- (Optional) Python 3.10+ for the ML service
 
### Install Packages
- npm run install:all

### 1. Backend

```bash
cd server
cp .env.example .env   # Edit with your MongoDB URI and JWT secret
npm install
npm run dev
```

Server runs on `http://localhost:5000`.

### 2. Frontend

```bash
cd client
npm install
npm run dev
```

Client runs on `http://localhost:5173`.

### 3. ML Service (separate developer)

```bash
cd ml-service
pip install -r requirements.txt 
uvicorn main:app --port 8000
```

> If the ML service is not running, the backend gracefully returns `score: null` and `reason: 'Scoring service unavailable'`.

## API Endpoints

See [api-contract.md](./api-contract.md) for the full API contract.

## Project Structure

```
HireMind/
├── server/           # Express API
│   ├── config/       # DB connection
│   ├── models/       # Mongoose schemas
│   ├── middleware/    # Auth middleware
│   ├── controllers/  # Business logic
│   └── routes/       # Route definitions
├── client/           # React SPA
│   └── src/
│       ├── components/  # Shared UI
│       ├── pages/       # Route pages
│       ├── services/    # API client
│       └── store/       # Zustand store
├── api-contract.md
└── README.md
```

## Environment Variables

### server/.env
```
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=your_secret
CLIENT_URL=http://localhost:5173
AI_SERVICE_URL=http://localhost:8000
```

### client/.env
```
VITE_API_URL=http://localhost:5000/api
```

## Team

- **M1 (MERN Developer)** — Frontend + Backend
- **M2 (ML Developer)** — FastAPI scoring service
