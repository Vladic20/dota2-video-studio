#!/bin/bash
cd "$(dirname "$0")"

if ! command -v grok >/dev/null 2>&1; then
  echo
  echo "Grok Build not found."
  echo "Install it first:"
  echo "  curl -fsSL https://x.ai/cli/install.sh | bash"
  echo
  echo "Then run this script again."
  read -p "Press Enter to exit..."
  exit 1
fi

echo "Starting Grok..."
echo "On first launch it will open the browser so you can log in."
echo
grok
