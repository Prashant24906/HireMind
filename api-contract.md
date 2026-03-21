# RecruitAI / HireMind — API Contract

> Shared between MERN developer (M1) and ML developer (M2)

---

## Auth

### POST /api/auth/register
- **Request:** `{ name, email, password, role }`
- **Response:** `{ token, user: { _id, name, email, role } }`

### POST /api/auth/login
- **Request:** `{ email, password }`
- **Response:** `{ token, user: { _id, name, email, role } }`

### GET /api/auth/me
- **Headers:** `Authorization: Bearer <token>`
- **Response:** `{ user }`

---

## Jobs

### POST /api/jobs
- **Auth:** interviewer or admin
- **Request:** `{ title, description, domain, difficulty }`
- **Response:** `{ job }`

### GET /api/jobs
- **Auth:** any logged-in user
- **Response:** `{ jobs[] }`
- Interviewers see only their own; candidates/admins see all open.

### GET /api/jobs/:id
- **Auth:** any logged-in user
- **Response:** `{ job }`

---

## Interview

### POST /api/interview/start
- **Auth:** candidate only
- **Request:** `{ jobId }`
- **Response:** `{ interviewId, questions: [{ _id, text }] }`

### POST /api/interview/answer
- **Auth:** candidate only
- **Request:** `{ interviewId, questionId, answerText }`
- **Response:** `{ score, breakdown: { accuracy, depth, clarity, application, critical }, reason, followUp? }`

### GET /api/interview/:interviewId
- **Auth:** owner or staff
- **Response:** `{ interview }`

---

## Results

### GET /api/results/:interviewId
- **Auth:** owner or staff
- **Response:** `{ candidateName, jobTitle, totalScore, status, questions[] }`

### GET /api/results/job/:jobId
- **Auth:** interviewer or admin
- **Response:** `{ candidates[] }` sorted by `totalScore` desc

---

## Admin

### GET /api/admin/stats
- **Auth:** admin only
- **Response:** `{ totalInterviews, completedInterviews, avgScore, completionRate, totalUsers, totalJobs }`

### GET /api/admin/users
- **Auth:** admin only
- **Response:** `{ users[] }`

---

## ML Service (FastAPI on port 8000)

> Built by ML developer. Backend calls these internally.

### POST /score
- **Request:** `{ question, answer, domain, difficulty }`
- **Response:** `{ score, breakdown: { accuracy, depth, clarity, application, critical }, reason }`

### POST /followup
- **Request:** `{ question, answer, score }`
- **Response:** `{ followUp }`
