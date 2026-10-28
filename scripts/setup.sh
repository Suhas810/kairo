#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"

fail() {
  printf 'Setup failed: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Required command '$1' was not found."
}

require_command git
require_command node
require_command npm

if command -v python3 >/dev/null 2>&1; then
  PYTHON="$(command -v python3)"
elif command -v python >/dev/null 2>&1; then
  PYTHON="$(command -v python)"
else
  fail "Python 3.11 or newer is required."
fi

"$PYTHON" -c 'import sys; raise SystemExit(0 if sys.version_info >= (3, 11) else 1)' \
  || fail "Python 3.11 or newer is required."
node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 20 ? 0 : 1)' \
  || fail "Node.js 20 or newer is required."

printf 'Using Python: '
"$PYTHON" --version
printf 'Using Node.js: '
node --version
printf 'Using npm: '
npm --version
git --version >/dev/null

if [[ -n "${SUPABASE_URL:-}" && -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]] ||
   [[ -z "${SUPABASE_URL:-}" && -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  fail "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together."
fi

create_venv() {
  local venv_dir="$1"
  local python_path="$venv_dir/bin/python"
  if [[ -x "$python_path" ]]; then
    printf 'Reusing %s\n' "${venv_dir#"$ROOT"/}"
  elif [[ -e "$venv_dir" ]]; then
    fail "Found an incomplete virtual environment at ${venv_dir#"$ROOT"/}; move or repair it before setup."
  else
    printf 'Creating %s\n' "${venv_dir#"$ROOT"/}"
    "$PYTHON" -m venv "$venv_dir"
  fi
}

cd "$ROOT"
create_venv "$ROOT/backend/.venv"
create_venv "$ROOT/sandbox/.venv"

printf 'Installing backend development dependencies...\n'
"$ROOT/backend/.venv/bin/python" -m pip install -r "$ROOT/backend/requirements-dev.txt"

printf 'Installing sandbox development dependencies...\n'
"$ROOT/sandbox/.venv/bin/python" -m pip install -r "$ROOT/sandbox/requirements-dev.txt"

printf 'Installing frontend dependencies...\n'
if [[ -f "$ROOT/frontend/package-lock.json" ]]; then
  (cd "$ROOT/frontend" && npm ci)
else
  (cd "$ROOT/frontend" && npm install)
fi

"$ROOT/backend/.venv/bin/python" -c 'import fastapi, pytest'
"$ROOT/sandbox/.venv/bin/python" -c 'import pydantic, pytest'
[[ -x "$ROOT/frontend/node_modules/.bin/vite" ]] \
  || fail "Frontend dependencies were not installed correctly (Vite is missing)."

if command -v docker >/dev/null 2>&1; then
  printf 'Docker is available; sandbox container tests can be enabled when its images are built.\n'
else
  printf 'Docker is not installed; local unit tests and development services do not require it.\n'
fi

if [[ ! -f "$ROOT/.env.example" && ! -f "$ROOT/backend/.env.example" && ! -f "$ROOT/frontend/.env.example" ]]; then
  printf 'No .env.example is present. No environment file was created or modified.\n'
  printf 'Backend integrations are optional; set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY together, and optionally GITHUB_WEBHOOK_SECRET in the process environment.\n'
fi

printf 'Setup checks passed. Run scripts/dev.sh to start local development.\n'
