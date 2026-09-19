#!/usr/bin/env bash
# Run PropDesk on Termux and serve it on this phone (localhost + Wi-Fi).
# Keep this session open. Open http://127.0.0.1:8080 in the phone browser.
set -euo pipefail

DIR="${PROPDESK_DIR:-$HOME/propdesk}"
PORT="${PORT:-8080}"

echo "==> updating packages"
pkg update -y
pkg install -y git nodejs

if [[ ! -d "$DIR/.git" ]]; then
  echo "==> cloning PropDesk"
  git clone https://github.com/Quantikz/propdesk.git "$DIR"
else
  echo "==> updating repo"
  git -C "$DIR" pull --ff-only || git -C "$DIR" pull --rebase || true
fi

cd "$DIR"

echo "==> installing npm packages (skip Playwright Chromium)"
npm install --ignore-scripts

export NODE_OPTIONS="${NODE_OPTIONS:---max-old-space-size=2048}"
# Optional Live AI. Leave unset to use the FAQ engine.
# export XAI_API_KEY="xai-..."

LAN_IP=""
if command -v ip >/dev/null 2>&1; then
  LAN_IP="$(ip -4 route get 1.1.1.1 2>/dev/null | awk '{for (i = 1; i <= NF; i++) if ($i == "src") { print $(i + 1); exit }}' || true)"
  if [[ -z "$LAN_IP" ]]; then
    LAN_IP="$(ip -4 addr show wlan0 2>/dev/null | awk '/inet /{print $2}' | cut -d/ -f1 | head -1 || true)"
  fi
fi

if command -v termux-wake-lock >/dev/null 2>&1; then
  termux-wake-lock || true
fi

echo
echo "PropDesk starting on port ${PORT}."
echo "  This phone:     http://127.0.0.1:${PORT}"
if [[ -n "${LAN_IP}" ]]; then
  echo "  Other devices:  http://${LAN_IP}:${PORT}"
fi
echo "Keep this Termux session running."
echo

if command -v termux-open-url >/dev/null 2>&1; then
  (sleep 6 && termux-open-url "http://127.0.0.1:${PORT}") &
fi

npm run dev
