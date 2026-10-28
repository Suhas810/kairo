#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
BACKEND_PYTHON="$ROOT/backend/.venv/bin/python"
FRONTEND_VITE="$ROOT/frontend/node_modules/.bin/vite"

fail() {
  printf 'Development startup failed: %s\n' "$*" >&2
  exit 1
}

[[ -x "$BACKEND_PYTHON" ]] || fail "Backend environment is missing; run scripts/setup.sh first."
[[ -x "$FRONTEND_VITE" ]] || fail "Frontend dependencies are missing; run scripts/setup.sh first."
if [[ -n "${SUPABASE_URL:-}" && -z "${SUPABASE_SERVICE_ROLE_KEY:-}" ]] ||
   [[ -z "${SUPABASE_URL:-}" && -n "${SUPABASE_SERVICE_ROLE_KEY:-}" ]]; then
  fail "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured together."
fi

backend_pid=""
frontend_pid=""

stop_children() {
  trap - EXIT INT TERM
  for child_pid in "$backend_pid" "$frontend_pid"; do
    if [[ -n "$child_pid" ]] && kill -0 "$child_pid" 2>/dev/null; then
      kill "$child_pid" 2>/dev/null || true
    fi
  done
  for child_pid in "$backend_pid" "$frontend_pid"; do
    if [[ -n "$child_pid" ]]; then
      wait "$child_pid" 2>/dev/null || true
    fi
  done
}
trap stop_children EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

(cd "$ROOT/backend" && exec "$BACKEND_PYTHON" -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000) &
backend_pid=$!
(cd "$ROOT/frontend" && exec npm run dev -- --host 127.0.0.1) &
frontend_pid=$!

sleep 1
for service in backend frontend; do
  if [[ "$service" == backend ]]; then child_pid="$backend_pid"; else child_pid="$frontend_pid"; fi
  if ! kill -0 "$child_pid" 2>/dev/null; then
    if wait "$child_pid"; then status=0; else status=$?; fi
    fail "$service exited during startup (exit code $status)."
  fi
done

printf 'Frontend: http://127.0.0.1:5173\n'
printf 'Backend:  http://127.0.0.1:8000\n'
printf 'API docs: http://127.0.0.1:8000/api/docs\n'
printf 'Press Ctrl+C to stop both services.\n'

while true; do
  for service in backend frontend; do
    if [[ "$service" == backend ]]; then child_pid="$backend_pid"; else child_pid="$frontend_pid"; fi
    if ! kill -0 "$child_pid" 2>/dev/null; then
      if wait "$child_pid"; then status=0; else status=$?; fi
      fail "$service exited unexpectedly (exit code $status)."
    fi
  done
  sleep 1
done
