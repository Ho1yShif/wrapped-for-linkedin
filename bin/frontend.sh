#!/usr/bin/env zsh
set -euo pipefail

# frontend.sh - start frontend (Vite) with hot reload
# Usage: ./bin/frontend.sh [--port PORT] [--help]

print_help() {
  cat <<-EOF
Usage: $(basename "$0") [options]

Options:
  --port PORT   Vite dev server port (default: 5173)
  --help        Show this help and exit

This script starts the frontend development server with hot reload.
It expects to be placed in the repository `bin/` directory and run from the repo root.

Frontend: npm --prefix frontend run dev

Before running, ensure you have installed frontend deps (npm install).
EOF
}

if [[ ${1:-} == "--help" ]]; then
  print_help
  exit 0
fi

# Defaults
FRONTEND_PORT=5173

# parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      FRONTEND_PORT="$2"; shift 2;;
    --help)
      print_help; exit 0;;
    *)
      echo "Unknown arg: $1" >&2; print_help; exit 2;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Check npm availability
command -v npm >/dev/null 2>&1 || { echo "npm not found in PATH. Install Node/npm to run frontend." >&2; exit 2; }

# helper: check node version meets Vite requirement (20.19+ or 22.12+)
node_version_ok() {
  if ! command -v node >/dev/null 2>&1; then
    return 2
  fi
  ver=$(node -v 2>/dev/null | sed 's/^v//')
  IFS='.' read -r major minor patch <<-EOF
${ver}
EOF
  major=${major:-0}
  minor=${minor:-0}
  # Accept >=23.x, or 22.x where minor>=12, or 20.x where minor>=19
  if [ "$major" -ge 23 ]; then
    return 0
  fi
  if [ "$major" -eq 22 ] && [ "$minor" -ge 12 ]; then
    return 0
  fi
  if [ "$major" -eq 20 ] && [ "$minor" -ge 19 ]; then
    return 0
  fi
  return 1
}

echo "Performing preflight checks..."

node_version_ok
node_ok=$?
if [ "$node_ok" -eq 2 ]; then
  echo "Node.js not found in PATH. Install Node >=20.19 or >=22.12 to run the frontend." >&2
  exit 2
elif [ "$node_ok" -ne 0 ]; then
  echo "Your Node.js version is too old for Vite. Please upgrade to Node 20.19+ or 22.12+." >&2
  echo "Suggested tools: nvm (https://github.com/nvm-sh/nvm) or Volta (https://volta.sh/)." >&2
  exit 2
fi

echo "Preflight checks passed."
echo "Starting frontend (Vite) on port $FRONTEND_PORT..."

cd "$ROOT_DIR"
# pass PORT env var to Vite
PORT="$FRONTEND_PORT" npm --prefix frontend run dev
