---
title: GitHub Action — PR scans
description: Diff-scoped agentic security scanning for pull requests with the XSEC composite action (planned, not yet shipped).
---

:::caution[Planned — not yet shipped]
The `uncesaii/xsec/.github/actions/xsec-scan` composite action does **not**
exist yet (there is no `.github/actions/` directory), and XSEC is **not**
published to npm. This page describes the intended design only — a roadmap item
(see [Diff-aware PR scanning](/roadmap/)). Until it ships, run PR scans by
invoking the CLI directly against the release binary or the
`ghcr.io/uncesaii/xsec` container image.
:::

## Intended design

A `xsec-scan` composite action that runs a diff-scoped security review on each
PR: confirmed findings posted as inline review comments on the changed lines,
unconfirmed hypotheses rolled into one summary comment.

**Planned inputs:** `mode` (`pr` = changed files via `git diff base...HEAD`,
`full` = whole tree), `profile` (`web`, `c-cpp`, `linux-kernel`),
`comment-on-pr`, `fail-on-confirmed` (exit non-zero on a confirmed finding),
`xsec-version`, `github-token`, `working-directory`.

**Planned outputs:** `findings-confirmed`, `findings-hypothesis`, and
`results-file` (path to `xsec-results.json`, also uploaded as an artifact).

Diff scoping requires the PR base commit in the local object DB, so a checkout
with `fetch-depth: 0` would be needed.

## Use the CLI today

Until the action ships, call the CLI from a workflow step. Provider credentials
go in as `env:` from repository secrets — one of `ANTHROPIC_API_KEY`,
`OPENAI_API_KEY`, `OPENROUTER_API_KEY`, or `AZURE_OPENAI_API_KEY`
(+ `AZURE_OPENAI_BASE_URL` + `AZURE_OPENAI_MODEL`). See [API Keys](/api-keys/).

```yaml
# .github/workflows/xsec.yml
name: xsec
on:
  pull_request:
    types: [opened, synchronize, reopened]

permissions:
  contents: read
  pull-requests: write

jobs:
  xsec:
    runs-on: ubuntu-latest
    container: ghcr.io/uncesaii/xsec:latest
    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0
      - run: |
          xsec review . \
            --diff-base "${{ github.event.pull_request.base.sha }}" \
            --changed-only \
            --format sarif > xsec-results.sarif
        env:
          ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
```

## This repository's dogfood lane

XSEC runs the same diff-aware review against its own trusted `main` delta in
`.github/workflows/dogfood-review.yml`. The workflow starts only after
`XSEC: Main` succeeds on `main`; it never runs model-backed review against PR
code or a fork. It builds `dist/xsec.js`, reviews `HEAD^..HEAD` with
`--changed-only --format sarif`, uploads the SARIF to code scanning, and keeps a
14-day evidence artifact.

Set the repository secret `DOGFOOD_OPENAI_API_KEY` before enabling the lane.
It uses direct OpenAI `gpt-5.6-luna` through the Responses API, with a hard
`$2` per-run review ceiling. It produces findings only; it never invokes `fix`,
`--apply`, or PR emission.

## See also

- [White-Box Mode](/white-box-mode/) — what the source review does.
- [API Keys](/api-keys/) — provider configuration.
