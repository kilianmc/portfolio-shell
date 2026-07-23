# Deployment checklist — portfolio-shell (Vercel)

This repo is the Module Federation **host** for **kilianmc.com**. It consumes
the `fundDashboard` remote via **`VITE_FUND_REMOTE_URL`** (read in
`vite.config.ts`, with the production remote as the built-in fallback).

Branch model: long-lived **`dev`** (integration) + **`main`** (production).
Feature PRs → `dev`; `main` receives only `dev`→`main` promotion PRs. Kilian
tests the dev URL, then merges the promotion PR to ship. See `CLAUDE.md`
(**Deployment (dev→prod)**) for the full convention.

## One-time Vercel dashboard setup

Do this in the **portfolio-shell** Vercel project (Settings):

- [ ] **Production Branch** = `main` (Settings → Git). Confirm `main` deploys to
      **kilianmc.com** (Settings → Domains).
- [x] Ensure the **`dev`** branch **auto-deploys** (Git integration deploys all
      pushed branches by default). Stable dev URL (confirmed 2026-07-20):
  - Dev URL: `https://portfolio-shell-git-dev-kilians-projects-7425dee2.vercel.app`
- [x] Set the env var **`VITE_FUND_REMOTE_URL`** (Settings → Environment
      Variables) with **per-scope** values so dev-shell ↔ dev-remote and
      prod-shell ↔ prod-remote line up. **Set via API 2026-07-20:**
  - [x] **Production** scope →
        `https://ai-portfolio-project1.vercel.app/remoteEntry.js`
  - [x] **Preview** scope (covers the `dev` branch and all non-prod deploys) →
        `https://ai-portfolio-project1-git-dev-kilians-projects-7425dee2.vercel.app/remoteEntry.js`
- [ ] **Redeploy the `dev` branch after setting the env var** — Vite inlines
      `VITE_*` at build time, so the value only takes effect on the next build.

## Deployment Protection (must stay OFF for previews)

- [x] Vercel Authentication (Settings → Deployment Protection) was **disabled**
      on 2026-07-20 for both this project and `fund-dashboard`. Left on, it
      SSO-gates non-production deploys (`302 → vercel.com/sso-api`), so the dev
      shell can't load the dev remote cross-origin. Keep it off.

## Per-deploy smoke check

- [ ] Open the **dev URL**, launch the project viewer, and confirm the
      `fundDashboard` remote mounts (loaded from the **dev** remoteEntry).
- [ ] Open **kilianmc.com** and confirm the remote mounts (loaded from the
      **prod** remoteEntry).
- [ ] Launch the **Photography Portfolio** project and confirm the Astro site
      loads in the viewer `<iframe>` (from `https://artlaia.pages.dev`). This is
      an iframe integration — no env var, `embedUrl` is a constant in
      `src/data/projects.ts`, so it behaves identically across dev and prod.
