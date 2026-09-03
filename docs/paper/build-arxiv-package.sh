#!/usr/bin/env bash
set -euo pipefail

OUT="xsec-arxiv-source.tar.gz"

rm -f "$OUT"

tar -czf "$OUT" \
  "xsec-submission.tex" \
  "xsec-submission.bbl" \
  "refs.bib"

echo "Wrote $(pwd)/$OUT"
