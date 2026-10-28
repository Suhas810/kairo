#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
BACKEND_PYTHON="$ROOT/backend/.venv/bin/python"

fail() {
  printf 'Build failed: %s\n' "$*" >&2
  exit 1
}

[[ -x "$BACKEND_PYTHON" ]] || fail "Backend environment is missing; run scripts/setup.sh first."
command -v npm >/dev/null 2>&1 || fail "npm is required to build the frontend."

printf 'Checking backend Python syntax...\n'
"$BACKEND_PYTHON" -c 'import ast, pathlib, sys; files = sorted(pathlib.Path(sys.argv[1]).rglob("*.py")); [ast.parse(path.read_text(encoding="utf-8"), filename=str(path)) for path in files]; print(f"Validated {len(files)} Python files.")' "$ROOT/backend/app"
"$BACKEND_PYTHON" -c 'import ast, pathlib, sys; files = sorted(pathlib.Path(sys.argv[1]).rglob("*.py")); [ast.parse(path.read_text(encoding="utf-8"), filename=str(path)) for path in files]; print(f"Validated {len(files)} Python files.")' "$ROOT/sandbox/runner"

printf 'Building frontend...\n'
(cd "$ROOT/frontend" && npm run build)
printf 'Frontend output: %s\n' "$ROOT/frontend/dist"

if [[ "${KAIRO_BUILD_CONTAINERS:-0}" == "1" ]]; then
  command -v docker >/dev/null 2>&1 || fail "KAIRO_BUILD_CONTAINERS=1 but Docker is unavailable."
  docker info >/dev/null 2>&1 || fail "Docker CLI is installed but its daemon is unavailable."
  printf 'Building images from the existing Dockerfiles...\n'
  docker build -f "$ROOT/backend/Dockerfile" -t kairo-backend:local "$ROOT/backend"
  docker build -f "$ROOT/sandbox/Dockerfile" -t kairo-sandbox:local "$ROOT/sandbox"
  printf 'Container images built: kairo-backend:local, kairo-sandbox:local\n'
else
  printf 'Container image builds skipped (set KAIRO_BUILD_CONTAINERS=1 to request them).\n'
fi

printf 'Build checks completed successfully.\n'
