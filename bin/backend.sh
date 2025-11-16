#!/usr/bin/env zsh
set -euo pipefail

# backend.sh - start backend (uvicorn) with hot reload in verbose mode
# Usage: ./bin/backend.sh [--port PORT] [--help]

print_help() {
  cat <<-EOF
Usage: $(basename "$0") [options]

Options:
  --port PORT   Uvicorn port for FastAPI (default: 8000)
  --help        Show this help and exit

This script starts the backend with hot reload and verbose error output.
It expects to be placed in the repository `bin/` directory and run from the repo root.

Backend: python -m uvicorn src.main:app --reload --port <port>

Before running, ensure you have a Python environment with requirements installed.
EOF
}

if [[ ${1:-} == "--help" ]]; then
  print_help
  exit 0
fi

# Defaults
BACKEND_PORT=8000
AUTO_INSTALL=${AUTO_INSTALL:-false}

# parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --port)
      BACKEND_PORT="$2"; shift 2;;
    --auto-install)
      AUTO_INSTALL=true; shift 1;;
    --help)
      print_help; exit 0;;
    *)
      echo "Unknown arg: $1" >&2; print_help; exit 2;;
  esac
done

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

# Check Python availability
command -v python >/dev/null 2>&1 || { echo "python not found in PATH. Activate Python environment to run backend." >&2; exit 2; }

# helper: check uvicorn import
uvicorn_available() {
  python - <<'PY'
try:
    import importlib.util as _imp_util
    found = _imp_util.find_spec('uvicorn') is not None
except Exception:
    found = False
print('1' if found else '0')
PY
}

echo "Performing preflight checks..."

# Check uvicorn availability
UVICORN_OK=$(uvicorn_available | tr -d '\n')
if [ "$UVICORN_OK" != "1" ]; then
  if [ "$AUTO_INSTALL" = true ]; then
    echo "uvicorn not found. Attempting to install backend requirements into current Python environment..."
    python -m pip install -r "$ROOT_DIR/backend/requirements.txt"
    # re-check
    UVICORN_OK=$(uvicorn_available | tr -d '\n')
  else
    echo "uvicorn (FastAPI server) is not installed in the current Python environment." >&2
    echo "Either activate your backend virtualenv or install requirements:" >&2
    echo "  python -m pip install -r backend/requirements.txt" >&2
    echo "Or re-run with --auto-install to attempt automatic installation into the current Python." >&2
    exit 2
  fi
fi

echo "Preflight checks passed."
echo "Starting backend on port $BACKEND_PORT (verbose mode)..."

cd "$ROOT_DIR/backend"
# Run uvicorn with verbose logging to show all errors and debug info
python -m uvicorn src.main:app --reload --host 127.0.0.1 --port "$BACKEND_PORT" --log-level debug
