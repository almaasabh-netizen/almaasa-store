#!/bin/bash
# Installs CLI tools that aren't part of the project's npm deps, so they are
# available in Claude Code on the web sessions (the container is ephemeral).
set -uo pipefail

[ "${CLAUDE_CODE_REMOTE:-}" != "true" ] && exit 0

# Playwright CLI (drive the app in a browser) + Supabase CLI (backend).
# Idempotent: npm -g skips packages already at the requested version.
command -v playwright-cli >/dev/null 2>&1 && command -v supabase >/dev/null 2>&1 || \
  npm install -g @playwright/cli@0.1.22 supabase@2.121.0 >/dev/null 2>&1 || true

# Point Playwright CLI at the Chromium preinstalled in this image.
if [ -x /opt/pw-browsers/chromium ] && [ ! -f "$CLAUDE_PROJECT_DIR/.playwright/cli.config.json" ]; then
  mkdir -p "$CLAUDE_PROJECT_DIR/.playwright"
  cat > "$CLAUDE_PROJECT_DIR/.playwright/cli.config.json" <<'JSON'
{ "browser": { "browserName": "chromium", "launchOptions": { "executablePath": "/opt/pw-browsers/chromium", "args": ["--no-sandbox"] } } }
JSON
fi

echo '{"systemMessage": "🧰 الأدوات جاهزة: Playwright CLI و Supabase CLI"}'
