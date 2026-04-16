#!/usr/bin/env bash
# Builds the Socios ADMS installer for macOS (.dmg) or Linux (.deb/.AppImage).
#
# Usage:
#   ./install.sh
#   ./install.sh --api-host 192.168.1.66 --api-port 3000
#   ./install.sh --skip-env

set -euo pipefail

API_HOST=""
API_PORT=""
SKIP_ENV=0

# ---------------------------------------------------------------------------
# Argument parsing
# ---------------------------------------------------------------------------
while [[ $# -gt 0 ]]; do
    case "$1" in
        --api-host) API_HOST="$2"; shift 2 ;;
        --api-port) API_PORT="$2"; shift 2 ;;
        --skip-env) SKIP_ENV=1; shift ;;
        *) echo "Unknown option: $1"; exit 1 ;;
    esac
done

if [[ $SKIP_ENV -eq 0 && ( -z "$API_HOST" || -z "$API_PORT" ) ]]; then
    echo "ERROR: Provide both --api-host and --api-port, or use --skip-env to skip .env setup."
    exit 1
fi

step() { printf '\n==> %s\n' "$*"; }

# ---------------------------------------------------------------------------
# 1. Prerequisites
# ---------------------------------------------------------------------------
step "Checking prerequisites"

for cmd in node npm cargo; do
    if ! command -v "$cmd" &>/dev/null; then
        case "$cmd" in
            node|npm) echo "ERROR: '$cmd' not found. Install Node 22 via nvm: https://github.com/nvm-sh/nvm" ;;
            cargo)    echo "ERROR: 'cargo' not found. Install Rust: https://rust-lang.org/tools/install" ;;
        esac
        exit 1
    fi
done

echo "  node   $(node --version)"
echo "  npm    $(npm --version)"
echo "  cargo  $(cargo --version)"

# ---------------------------------------------------------------------------
# 2. npm install
# ---------------------------------------------------------------------------
step "Installing npm dependencies"
npm install

# ---------------------------------------------------------------------------
# 3. Build
# ---------------------------------------------------------------------------
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

OS="$(uname -s)"
case "$OS" in
    Darwin)
        step "Building macOS .dmg (this may take a few minutes)"
        npm run tauri build

        step "Locating installer artifact"
        BUNDLE_DIR="$SCRIPT_DIR/src-tauri/target/release/bundle/dmg"
        ARTIFACT="$(ls -t "$BUNDLE_DIR"/*.dmg 2>/dev/null | head -1)"
        ;;
    Linux)
        step "Building Linux packages (this may take a few minutes)"
        npm run tauri build

        step "Locating installer artifact"
        # Prefer .deb, fall back to AppImage
        ARTIFACT="$(ls -t "$SCRIPT_DIR/src-tauri/target/release/bundle/deb"/*.deb 2>/dev/null | head -1 || true)"
        if [[ -z "$ARTIFACT" ]]; then
            ARTIFACT="$(ls -t "$SCRIPT_DIR/src-tauri/target/release/bundle/appimage"/*.AppImage 2>/dev/null | head -1 || true)"
        fi
        ;;
    *)
        echo "ERROR: Unsupported OS: $OS. This script supports macOS and Linux only."
        exit 1
        ;;
esac

if [[ -z "${ARTIFACT:-}" ]]; then
    echo "ERROR: No installer artifact found. Check the build output above."
    exit 1
fi

echo "  Found: $ARTIFACT"
DEST="$SCRIPT_DIR/$(basename "$ARTIFACT")"
cp "$ARTIFACT" "$DEST"
echo "  Copied to: $DEST"

# ---------------------------------------------------------------------------
# 4. Runtime .env setup
# ---------------------------------------------------------------------------
if [[ $SKIP_ENV -eq 0 ]]; then
    step "Writing runtime configuration"

    case "$OS" in
        Darwin) CONFIG_DIR="$HOME/Library/Application Support/Socios ADMS" ;;
        Linux)  CONFIG_DIR="${XDG_CONFIG_HOME:-$HOME/.config}/Socios ADMS" ;;
    esac

    mkdir -p "$CONFIG_DIR"
    ENV_FILE="$CONFIG_DIR/.env"
    printf 'API_HOST=%s\nAPI_PORT=%s\n' "$API_HOST" "$API_PORT" > "$ENV_FILE"

    echo "  Written: $ENV_FILE"
    echo "  API_HOST=$API_HOST"
    echo "  API_PORT=$API_PORT"
fi

# ---------------------------------------------------------------------------
# Done
# ---------------------------------------------------------------------------
printf '\nDone. Installer ready at: %s\n' "$DEST"
