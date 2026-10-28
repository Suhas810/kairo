#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd -P)"
ROOT="$(cd -- "$SCRIPT_DIR/.." && pwd -P)"
MODE="${1:---dry-run}"

if [[ "$#" -gt 1 || ( "$MODE" != --dry-run && "$MODE" != --apply ) ]]; then
  printf 'Usage: %s [--dry-run|--apply]\n' "$0" >&2
  exit 2
fi
[[ -d "$ROOT/.git" || -f "$ROOT/.git" ]] || {
  printf 'Cleanup refused: resolved repository root does not contain Git metadata.\n' >&2
  exit 1
}
[[ "$ROOT" != "/" && "$ROOT" != "$HOME" ]] || {
  printf 'Cleanup refused: repository root resolves to a dangerous path.\n' >&2
  exit 1
}

remove_targets=()
for scope in "$ROOT/backend" "$ROOT/sandbox"; do
  [[ -d "$scope" ]] || continue
  while IFS= read -r -d '' cache_dir; do
    remove_targets+=("$cache_dir")
  done < <(find "$scope" -type d -name __pycache__ -prune -print0)
done

for target in \
  "$ROOT/backend/.pytest_cache" \
  "$ROOT/sandbox/.pytest_cache" \
  "$ROOT/backend/.coverage" \
  "$ROOT/sandbox/.coverage" \
  "$ROOT/backend/htmlcov" \
  "$ROOT/sandbox/htmlcov" \
  "$ROOT/frontend/dist" \
  "$ROOT/frontend/.vite"; do
  if [[ -e "$target" ]]; then
    remove_targets+=("$target")
  fi
done

if [[ "${#remove_targets[@]}" -eq 0 ]]; then
  printf 'Nothing to clean; no project-generated cache or build artifacts were found.\n'
  exit 0
fi

printf 'Generated artifacts in scope:\n'
for target in "${remove_targets[@]}"; do
  case "$target" in
    "$ROOT"/*) printf '  %s\n' "${target#"$ROOT"/}" ;;
    *) printf 'Cleanup refused: a target is outside the repository.\n' >&2; exit 1 ;;
  esac
done

if [[ "$MODE" == --dry-run ]]; then
  printf 'Dry run only. Review the list, then run scripts/cleanup.sh --apply to remove these paths.\n'
  exit 0
fi

printf 'Type CLEANUP to remove only the paths listed above: '
IFS= read -r confirmation
[[ "$confirmation" == CLEANUP ]] || {
  printf 'Cleanup cancelled; nothing was removed.\n'
  exit 1
}

for target in "${remove_targets[@]}"; do
  case "$target" in
    "$ROOT"/*) rm -rf -- "$target" ;;
    *) printf 'Cleanup refused: a target is outside the repository.\n' >&2; exit 1 ;;
  esac
done
printf 'Cleanup completed.\n'
