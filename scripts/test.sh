#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
GROUP="${1:-all}"

if [[ "$#" -gt 1 ]] || [[ "$GROUP" != all && "$GROUP" != backend && "$GROUP" != sandbox && "$GROUP" != frontend && "$GROUP" != integration ]]; then
  printf 'Usage: %s [all|backend|sandbox|frontend|integration]\n' "$0" >&2
  exit 2
fi

BACKEND_PYTHON="$ROOT/backend/.venv/bin/python"
SANDBOX_PYTHON="$ROOT/sandbox/.venv/bin/python"
if [[ "$GROUP" == all || "$GROUP" == backend ]]; then
  [[ -x "$BACKEND_PYTHON" ]] || { printf 'Backend environment is missing; run scripts/setup.sh first.\n' >&2; exit 1; }
fi
if [[ "$GROUP" == all || "$GROUP" == sandbox || "$GROUP" == integration ]]; then
  [[ -x "$SANDBOX_PYTHON" ]] || { printf 'Sandbox environment is missing; run scripts/setup.sh first.\n' >&2; exit 1; }
fi

run_backend_tests() {
  printf '\n== Backend tests ==\n'
  (cd "$ROOT/backend" && "$BACKEND_PYTHON" -m pytest tests/unit tests/integration tests/test_routes.py -q)
}

run_sandbox_tests() {
  printf '\n== Sandbox unit tests ==\n'
  (cd "$ROOT/sandbox" && "$SANDBOX_PYTHON" -m pytest tests/test_runner.py -q)
}

run_frontend_validation() {
  printf '\n== Frontend production build and TypeScript validation ==\n'
  (cd "$ROOT/frontend" && npm run build)
}

run_sandbox_integration() {
  printf '\n== Optional Docker sandbox integration tests ==\n'
  (cd "$ROOT/sandbox" && "$SANDBOX_PYTHON" -m pytest tests/test_integration.py -q -rs)
}

case "$GROUP" in
  all)
    run_backend_tests
    run_sandbox_tests
    run_frontend_validation
    ;;
  backend) run_backend_tests ;;
  sandbox) run_sandbox_tests ;;
  frontend) run_frontend_validation ;;
  integration)
    run_backend_tests
    run_sandbox_tests
    run_sandbox_integration
    ;;
esac

printf '\nChecks completed successfully for group: %s\n' "$GROUP"
