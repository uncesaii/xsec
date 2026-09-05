#!/usr/bin/env bash
# post-merge-rebrand.sh — Re-stamp XSEC rebrand after upstream merge.
#
# After merging upstream/main into our branch, some files may have lost
# our rebrand strings (0sec → xsec, @0sec → @xsec, etc.) because upstream
# introduced new code. This script re-applies our replacements across all
# source files so the rebrand is preserved without blocking upstream features.
#
# Run automatically by the upstream-sync workflow after merge, or manually:
#   bash scripts/post-merge-rebrand.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

CHANGED=0

rebrand() {
  local file="$1"
  local old="$2"
  local new="$3"
  if grep -q "$old" "$file" 2>/dev/null; then
    sed -i "s|$old|$new|g" "$file"
    CHANGED=1
  fi
}

echo "post-merge-rebrand: scanning for 0sec → xsec replacements..."

# ── Package scope ──────────────────────────────────────────────────────────
for f in $(git ls-files -- '*.ts' '*.tsx' '*.js' '*.mjs' '*.json' '*.yml' '*.yaml' '*.sh' '*.md' '*.html'); do
  # Skip files that should NOT be rebranded (upstream-internal, LICENSE, NOTICE)
  case "$f" in
    LICENSE*|NOTICE|.gitattributes|.upstream-version|pnpm-lock.yaml) continue ;;
    node_modules/*|dist/*|*.lock) continue ;;
  esac

  # @0sec/ → @xsec/ (npm scope)
  rebrand "$f" "@0sec/" "@xsec/"

  # "0sec Labs" → "XSEC Labs" (brand name)
  rebrand "$f" "0sec Labs" "XSEC Labs"

  # "0sec:" → "XSEC:" (workflow names, comments)
  rebrand "$f" '"0sec:' '"XSEC:'

  # "0sec-" → "xsec-" (binary names, artifact names, concurrency groups)
  rebrand "$f" "0sec-" "xsec-"

  # "0sec.app" → "xsec.app" (desktop bundle)
  rebrand "$f" "0sec.app" "xsec.app"

  # "0sec.js" → "xsec.js" (binary entrypoint)
  rebrand "$f" "0sec.js" "xsec.js"

  # "0sec/" → "xsec/" (directory references in paths — but NOT URLs)
  # Be careful not to replace in github.com/0sec-labs URLs
  rebrand "$f" "/opt/0sec/" "/opt/xsec/"

  # "0SEC_" → "XSEC_" (env var prefix — only in user-facing scripts)
  case "$f" in
    scripts/*.sh|scripts/*.mjs|.github/workflows/*.yml)
      rebrand "$f" "0SEC_" "XSEC_"
      ;;
  esac

  # serverName: "0sec" → "xsec" (DSH config)
  rebrand "$f" 'serverName: "0sec"' 'serverName: "xsec"'

  # XSEC_DASHBOARD_READY protocol (if upstream reverted it)
  rebrand "$f" "0SEC_DASHBOARD_READY" "XSEC_DASHBOARD_READY"

  # Desktop build config
  rebrand "$f" '"com.0security.osec"' '"com.xsec.app"'
  rebrand "$f" '"productName": "0sec"' '"productName": "xsec"'
  rebrand "$f" '"executableName": "0sec"' '"executableName": "xsec"'
  rebrand "$f" '"desktopName": "0sec"' '"desktopName": "xsec"'

done

if [ "$CHANGED" -eq 1 ]; then
  echo "post-merge-rebrand: rebrand applied. Review changes with: git diff --stat"
else
  echo "post-merge-rebrand: no changes needed — rebrand is current."
fi
