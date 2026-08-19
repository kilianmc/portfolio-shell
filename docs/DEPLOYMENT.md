# Deployment checklist — portfolio-shell (Vercel)

This repo is the Module Federation **host** for **kilianmc.com**. It consumes
the `fundDashboard` remote via **`VITE_FUND_REMOTE_URL`** and the `climbTrainer`
remote via **`VITE_CLIMB_REMOTE_URL`** (both read in `vite.config.ts`, each with
the production remote as the built-in fallback).

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
- [ ] Set the env var **`VITE_CLIMB_REMOTE_URL`** the same way:
  - [ ] **Production** scope → `https://climb.kilianmc.com/remoteEntry.js`
  - [ ] **Preview** scope → `https://climb.kilianmc.com/remoteEntry.js` as well,
        **not** the branch alias: `climb-trainer` keeps Deployment Protection
        **on** for previews by deliberate decision, so
        `https://climb-trainer-git-dev-kilians-projects-7425dee2.vercel.app/remoteEntry.js`
        answers `302 → vercel.com/sso-api` and cannot be loaded cross-origin
        (confirmed 2026-08-17). The dev shell therefore loads the **production**
        climb remote until that project gains a non-SSO stable alias.
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
- [ ] Launch **Climbing Training Planner** and confirm the `climbTrainer` remote
      mounts with a **clean console** — a share-version mismatch on the remote
      side only logs `Failed to bridge external shared module` and still renders,
      so the console is the only signal. Until `climb-trainer` promotes its first
      production build, `https://climb.kilianmc.com/remoteEntry.js` answers
      `200 text/html` (the SPA rewrite) and the card falls back to the
      `ErrorBoundary`.
- [ ] Launch the **Photography Portfolio** project and confirm the Astro site
      loads in the viewer `<iframe>` (from `https://artlaia.pages.dev`). This is
      an iframe integration — no env var, `embedUrl` is a constant in
      `src/data/projects.ts`, so it behaves identically across dev and prod.
