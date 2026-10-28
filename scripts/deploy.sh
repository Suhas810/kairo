#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
TARGET="${1:-}"

fail() {
  printf 'Deployment blocked: %s\n' "$*" >&2
  exit 1
}

if [[ "$#" -ne 1 || ( "$TARGET" != preview && "$TARGET" != production ) ]]; then
  printf 'Usage: %s [preview|production]\n' "$0" >&2
  exit 2
fi

command -v vercel >/dev/null 2>&1 \
  || fail "Vercel CLI is required for the documented frontend host. Install it using Vercel's official instructions."
[[ -f "$ROOT/frontend/.vercel/project.json" ]] \
  || fail "The frontend has no linked Vercel project. From frontend/, run 'vercel link' and configure its project before retrying. No deployment was made."

if ! vercel whoami >/dev/null 2>&1; then
  fail "Vercel CLI is not authenticated. Run 'vercel login' and retry. Authentication output was suppressed."
fi

printf 'Running deterministic tests and frontend build validation...\n'
"$SCRIPT_DIR/test.sh" all
"$SCRIPT_DIR/build.sh"

if [[ "$TARGET" == production ]]; then
  printf 'This deploys the Vercel frontend to production. Type DEPLOY to authorize this production deployment: '
  IFS= read -r confirmation
  [[ "$confirmation" == DEPLOY ]] || fail "Production authorization was not provided."
  (cd "$ROOT/frontend" && vercel deploy --prod --yes)
else
  (cd "$ROOT/frontend" && vercel deploy --yes)
fi

printf '\nVercel frontend deployment completed.\n'
printf 'This script does not deploy the FastAPI backend. The repository identifies Nebius AI Cloud as its host but does not define a backend deployment CLI/project configuration. Configure and deploy the backend separately using docs/deployment/nebius.md and docs/deployment/production.md.\n'
