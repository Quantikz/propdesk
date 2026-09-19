#!/data/data/com.termux/files/usr/bin/bash
# PropDesk — clone (if needed) and serve on localhost for Termux.
set -euo pipefail

REPO_URL="${REPO_URL:-https://github.com/Quantikz/propdesk.git}"
DIR="${PROPDESK_DIR:-$HOME/propdesk}"
PORT="${PORT:-8080}"
URL="http://127.0.0.1:${PORT}"

echo "[*] Checking packages..."
pkg update -y >/dev/null 2>&1 || true
for p in git python; do
  if ! command -v "$p" >/dev/null 2>&1; then
    echo "[*] Installing $p..."
    pkg install -y "$p"
  fi
done

if [ ! -d "$DIR/.git" ]; then
  echo "[*] Cloning $REPO_URL -> $DIR"
  git clone "$REPO_URL" "$DIR"
else
  echo "[*] Updating $DIR"
  git -C "$DIR" pull --ff-only || echo "[!] git pull failed — using local copy"
fi

cd "$DIR"
echo "[*] Serving $DIR on $URL"
echo "[*] Leave this session open. Tap $URL in Chrome/Firefox if the browser does not open."
echo

open_browser() {
  if command -v termux-open-url >/dev/null 2>&1; then
    termux-open-url "$URL"
  elif command -v am >/dev/null 2>&1; then
    am start -a android.intent.action.VIEW -d "$URL" >/dev/null 2>&1 || true
  fi
}

# Give the server a moment, then try to open the phone browser.
(sleep 1; open_browser) &

exec python -m http.server "$PORT" --bind 127.0.0.1
