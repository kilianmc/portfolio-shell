# Deployment checklist — portfolio-shell (Vercel)

This repo is the Module Federation **host** for **kilianmc.com**. It consumes
the `fundDashboard` remote via **`VITE_FUND_REMOTE_URL`** (read in
`vite.config.js`, with the production remote as the built-in fallback).

Branch model: long-lived **`dev`** (integration) + **`main`** (production).
Feature PRs → `dev`; `main` receives only `dev`→`main` promotion PRs. Kilian
tests the dev URL, then merges the promotion PR to ship. See `CLAUDE.md`
(**Deployment (dev→prod)**) for the full convention.

## One-time Vercel dashboard setup

Do this in the **portfolio-shell** Vercel project (Settings):

- [ ] **Production Branch** = `main` (Settings → Git). Confirm `main` deploys to
      **kilianmc.com** (Settings → Domains).
- [ ] Ensure the **`dev`** branch **auto-deploys** (Git integration deploys all
      pushed branches by default). After `dev` exists and first deploys, record
      its **stable dev URL** below.
  - Dev URL: `_______________________________________`
  - Expected shape: `https://portfolio-shell-git-dev-kilianmc.vercel.app`
- [ ] Set the env var **`VITE_FUND_REMOTE_URL`** (Settings → Environment
      Variables) with **per-scope** values so dev-shell ↔ dev-remote and
      prod-shell ↔ prod-remote line up.
  - [ ] **Production** scope →
        `https://ai-portfolio-project1.vercel.app/remoteEntry.js`
  - [ ] **Preview** scope (covers the `dev` branch and all non-prod deploys) →
        `https://ai-portfolio-project1-git-dev-kilianmc.vercel.app/remoteEntry.js`
- [ ] **Redeploy the `dev` branch after setting the env var** — Vite inlines
      `VITE_*` at build time, so the value only takes effect on the next build.

## Verify the exact dev remote URL

- [ ] Confirm the **Preview**-scope URL above matches what the **fund-dashboard**
      dev deploy **actually serves**. Get the real dev slug from the
      **fund-dashboard** Vercel dashboard (its `dev`-branch deploy) and append
      `/remoteEntry.js`. If the slug differs, update the Preview value and
      redeploy `dev`.

## Per-deploy smoke check

- [ ] Open the **dev URL**, launch the project viewer, and confirm the
      `fundDashboard` remote mounts (loaded from the **dev** remoteEntry).
- [ ] Open **kilianmc.com** and confirm the remote mounts (loaded from the
      **prod** remoteEntry).
