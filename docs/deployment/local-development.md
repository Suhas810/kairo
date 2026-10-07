# Local Development

## Overview

This document explains how to run **Kairo** locally for development, testing, and debugging.

Kairo is developed as a full-stack application with:

- **Frontend:** React + TypeScript + Vite
- **Backend:** Python + FastAPI
- **Database:** Supabase
- **AI:** Nebius AI
- **Search:** Tavily
- **Containerization:** Docker
- **Version Control:** Git + GitHub

---

## Prerequisites

Install the following before starting development:

- Node.js 20+
- npm
- Python 3.11+
- Git
- Docker
- Docker Compose
- A Supabase account
- A Nebius account/API key
- A Tavily API key

Verify installations:

```bash
node --version
npm --version
python --version
git --version
docker --version
```

---

## Repository Setup

Clone the repository:

```bash
git clone https://github.com/<username>/kairo.git
cd kairo
```

Create the required environment files from the provided examples:

```bash
cp .env.example .env
```

Do not commit `.env` files containing secrets.

---

## Frontend Setup

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend will normally be available at:

```text
http://localhost:5173
```

---

## Backend Setup

Navigate to the backend:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv .venv
```

Activate it on Windows:

```powershell
.venv\Scripts\activate
```

Activate it on Linux/macOS:

```bash
source .venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

The backend will normally run at:

```text
http://localhost:8000
```

API documentation:

```text
http://localhost:8000/docs
```

---

## Environment Variables

The backend should contain environment variables for external services.

Example:

```env
NEBIUS_API_KEY=
TAVILY_API_KEY=

SUPABASE_URL=
SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

FRONTEND_URL=http://localhost:5173
```

Frontend variables should use the Vite prefix:

```env
VITE_API_URL=http://localhost:8000
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Never expose private backend secrets through frontend environment variables.

---

## Running the Complete Application

Open two terminals.

### Terminal 1 — Backend

```bash
cd backend
source .venv/bin/activate
uvicorn app.main:app --reload
```

### Terminal 2 — Frontend

```bash
cd frontend
npm run dev
```

Then open:

```text
http://localhost:5173
```

---

## Docker Development

Kairo can also be run using Docker.

Build the containers:

```bash
docker compose build
```

Start the application:

```bash
docker compose up
```

Run in detached mode:

```bash
docker compose up -d
```

Stop the containers:

```bash
docker compose down
```

View logs:

```bash
docker compose logs -f
```

---

## Local Development Workflow

Recommended workflow:

```text
Create Feature
      ↓
Create Git Branch
      ↓
Develop Locally
      ↓
Run Backend Tests
      ↓
Run Frontend Tests
      ↓
Test Agent Workflow
      ↓
Test API Integration
      ↓
Commit Changes
      ↓
Push to GitHub
      ↓
Create Pull Request
```

---

## Git Branching

Use feature branches:

```bash
git checkout -b feature/<feature-name>
```

Example:

```bash
git checkout -b feature/agent-planner
```

Commit changes:

```bash
git add .
git commit -m "Add agent planning workflow"
```

Push:

```bash
git push origin feature/agent-planner
```

---

## Local Testing Checklist

Before pushing changes:

- [ ] Frontend starts successfully
- [ ] Backend starts successfully
- [ ] Supabase connection works
- [ ] Nebius API works
- [ ] Tavily search works
- [ ] Agent workflow executes correctly
- [ ] API errors are handled
- [ ] Frontend API requests work
- [ ] No secrets are committed
- [ ] Docker build succeeds
- [ ] Tests pass

---

## Important Rules

Never commit:

```text
.env
.env.local
API keys
service-role keys
private credentials
```

Use:

```text
.env.example
```

to document required environment variables without exposing their values.