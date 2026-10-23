# Vercel

## Overview

Vercel is used to deploy the **Kairo frontend**.

The frontend is built using:

- React
- TypeScript
- Vite
- Tailwind CSS

The production architecture separates the frontend deployment from the backend and AI infrastructure.

```text
                    ┌──────────────┐
                    │    User      │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │   Vercel     │
                    │   Frontend   │
                    └──────┬───────┘
                           ↓
                    ┌──────────────┐
                    │   FastAPI    │
                    │   Backend    │
                    └──────┬───────┘
                           ↓
                 ┌─────────┴─────────┐
                 ↓                   ↓
             Supabase             Nebius
```

---

## Frontend Build

Install dependencies:

```bash
npm install
```

Build the application:

```bash
npm run build
```

The generated production build is created by Vite.

---

## Vercel Project Configuration

The Vercel project should point to the frontend application directory.

Example structure:

```text
kairo/
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── vite.config.ts
│
└── backend/
```

The Vercel project should use:

```text
Root Directory: frontend
```

---

## Environment Variables

Frontend environment variables should contain only values safe for browser-side use.

Example:

```env
VITE_API_URL=https://<backend-domain>
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Do not put:

```env
NEBIUS_API_KEY=
SUPABASE_SERVICE_ROLE_KEY=
TAVILY_API_KEY=
```

into the frontend environment.

These belong on the backend.

---

## Deployment

After connecting the GitHub repository to Vercel, deployments can be triggered automatically from the configured branch.

Typical workflow:

```text
GitHub
   ↓
Push
   ↓
Vercel Build
   ↓
Vite Production Build
   ↓
Deployment
   ↓
Production URL
```

---

## Preview Deployments

Feature branches can be deployed as preview environments.

```text
feature branch
      ↓
GitHub
      ↓
Vercel Preview
      ↓
Testing
```

This allows features to be tested before production deployment.

---

## Production Deployment

Production deployment should happen only after:

- Frontend tests pass
- Backend integration works
- API endpoints are verified
- Supabase connection works
- Agent workflow works
- Nebius integration works
- Production environment variables are configured

---

## Frontend API Configuration

The frontend should communicate with the backend using:

```env
VITE_API_URL=https://api.<production-domain>
```

Example:

```text
Browser
   ↓
https://kairo.<domain>
   ↓
Vercel
   ↓
FastAPI Backend
```

---

## CORS

The backend must allow requests from the production frontend domain.

Example:

```text
Development:
http://localhost:5173

Production:
https://<kairo-production-domain>
```

Avoid allowing unrestricted origins in production.

---

## Deployment Checklist

- [ ] GitHub repository connected
- [ ] Root directory configured
- [ ] Build command verified
- [ ] Environment variables configured
- [ ] Production API URL configured
- [ ] CORS configured
- [ ] Supabase connection tested
- [ ] Authentication tested
- [ ] Agent workflow tested
- [ ] Production build tested
- [ ] Preview deployment tested