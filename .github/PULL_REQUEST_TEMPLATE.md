<!--
Keep PRs small and focused. See CLAUDE.md for conventions and the
Module Federation host contract.
-->

## Summary

<!-- What does this PR do and why? One or two sentences. -->

Closes #

## Changes

<!-- Bullet the notable changes. -->

-

## Screenshots / Preview URL

<!-- Vercel deploy preview URL, plus screenshots for any visual change. -->

- Preview:

## Checklist

- [ ] `npm run build` passes locally.
- [ ] Lint/tests pass (or N/A — tooling not yet present; see issues #2/#3).
- [ ] Module Federation host contract is unaffected — remote still loads
      (`VITE_FUND_REMOTE_URL`, React shared singleton, `chrome89` build target).
- [ ] Any remote-contract change is coordinated with the `fund-dashboard` repo.
- [ ] Docs updated (`CLAUDE.md` / `README.md`) if behavior or conventions changed.
- [ ] Diff is focused and scoped to this issue.
