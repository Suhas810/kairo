# Local Development

## Prerequisites

- Git
- Node.js 20 or newer and npm
- Python 3.11 or newer
- Docker (optional; required for sandbox container execution and optional Docker integration tests)

Supabase, Nebius, and other external service credentials are not required for the current deterministic local tests.

## Setup

From the repository root, run:

```bash
bash scripts/setup.sh
```

On Windows PowerShell:

```powershell
.\scripts\setup.ps1
```

Setup creates or reuses `backend/.venv` and `sandbox/.venv`, installs dependencies from the existing requirements files, and installs frontend dependencies using `npm ci` when a lockfile is present (otherwise `npm install`). It does not create or overwrite environment files.

The backend currently reads `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `GITHUB_WEBHOOK_SECRET` from its process environment. Supabase settings are optional but must be set together. The app does not load `.env` files, and this repository currently has no `.env.example`; set any needed variables in the environment used to launch the application. Keep backend secrets out of frontend configuration.

## Run the application

Start both development services from the repository root:

```bash
bash scripts/dev.sh
```

On Windows PowerShell:

```powershell
.\scripts\dev.ps1
```

The services bind to loopback only. The scripts report these configured local endpoints after startup:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:8000`
- API docs: `http://127.0.0.1:8000/api/docs`

Press Ctrl+C to stop both services. This repository does not currently define a Docker Compose development stack.

## Tests and build

```bash
bash scripts/test.sh                 # backend, sandbox unit tests, and frontend build/type check
bash scripts/test.sh backend         # backend unit and deterministic integration-boundary tests
bash scripts/test.sh sandbox         # sandbox unit tests
bash scripts/test.sh integration     # also run Docker sandbox integration tests
bash scripts/build.sh                # frontend production build and Python syntax checks
```

The Docker sandbox integration tests skip individual cases when Docker, its daemon, or the prebuilt sandbox images are unavailable. They do not invoke live AI services. There are no configured frontend unit-test or lint commands at present. To build the existing Dockerfiles explicitly, set `KAIRO_BUILD_CONTAINERS=1` when running `scripts/build.sh`.

The test script is Bash and should be run with Bash on Windows (for example, in Git Bash or WSL); setup and development also have native PowerShell scripts.

## Deployment

`bash scripts/deploy.sh preview` and `bash scripts/deploy.sh production` deploy the frontend to an already linked Vercel project. The production command requires typing `DEPLOY`. The backend is documented as hosted on Nebius AI Cloud, but this repository does not yet define a backend deployment CLI or project configuration; deploy and configure it separately. See [Vercel](vercel.md), [Nebius](nebius.md), and [Production](production.md).

## Safe cleanup

`bash scripts/cleanup.sh` lists project-generated caches/build outputs in dry-run mode. To remove only the listed artifacts, run `bash scripts/cleanup.sh --apply` and type `CLEANUP`. The script does not remove environment files, virtual environments, source code, Git data, or persistent data.
