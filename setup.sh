#!/usr/bin/env bash
set -euo pipefail

# Backward-compatible entrypoint.
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
exec bash "$SCRIPT_DIR/scripts/setup.sh"
