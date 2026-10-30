# Kairo Local Development Guide

## Prerequisites

- Node.js (v20+) & npm
- Python (v3.11+)
- Docker (optional for isolated containers; local process fallback is supported)
- Supabase project credentials (for persistence & auth)
- NVIDIA API Key (for live Nemotron model inference)

---

## 1. Environment Setup

Copy example environment files:

```bash
# In backend/
cp .env.example .env

# In root / frontend
cp .env.example .env
```

Set your credentials in `backend/.env`:
```dotenv
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NVIDIA_API_KEY=nvapi-...
```

---

## 2. Running the Backend

From the repository root:

```powershell
cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install -r requirements-dev.txt
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

The API will be available at `http://127.0.0.1:8000`:
- Health check: `http://127.0.0.1:8000/api/v1/health`
- Swagger UI docs: `http://127.0.0.1:8000/api/docs`

Run backend tests:
```powershell
python -m pytest
```

---

## 3. Running the Frontend

From the repository root in a separate terminal:

```powershell
cd frontend
npm.cmd install
npm.cmd run dev
```

Open `http://localhost:5173` in your browser.

Run frontend tests & build checks:
```powershell
npm.cmd test
npm.cmd run lint
npm.cmd run build
```

---

## 4. Running Sandbox Tests

```powershell
cd sandbox
python -m pytest
```

