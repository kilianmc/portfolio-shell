# CLAUDE.md — portfolio-shell

Guidance for AI agents (and humans) working in this repo. Read it before opening a PR.

## Overview

This repo is **`portfolio-shell`**, the landing site at **kilianmc.com** and the
**Module Federation _host_** for a microfrontend portfolio. It renders the
personal site (about, experience, projects, contact) and loads each showcase
project as an independently deployed **Module Federation remote** at runtime.

Today it consumes one remote — the **`fundDashboard`** remote (the
[`fund-dashboard`](https://github.com/kilianmc/fund-dashboard) repo) — mounted
on demand inside `ProjectViewer`.

This repo runs an **AI-as-Agent** development loop: issues are implemented by
agents that open focused PRs. Keep changes small and reviewable.

## Stack

- **React 18** (`^18.2.0`) — function components + hooks; one class component
  (`ErrorBoundary`).
- **Vite 8** with `@vitejs/plugin-react`.
- **`@module-federation/vite`** for Module Federation (host role).
- **Plain CSS** — a single global `src/index.css`. **No SCSS, no CSS modules,
  no CSS-in-JS.**
- **Plain JavaScript / JSX — no TypeScript.** There is no `tsconfig.json`;
  federated type generation is disabled (`dts: false`).
- **Node** per `.nvmrc` = `23.10.0` (`package.json` engines: `>=20.19`).
- Deployed on **Vercel** via Git integration (SPA rewrite in `vercel.json`).

## Project structure

```
index.html            # entry HTML; loads /src/main.jsx, Google Fonts
vite.config.js        # MF host config (remotes, shared singletons, build target)
vercel.json           # SPA rewrite (all routes -> /index.html)
.env.example          # VITE_FUND_REMOTE_URL documentation
src/
  main.jsx            # ReactDOM root, imports index.css
  App.jsx             # layout, section nav, opens/closes ProjectViewer
  index.css           # ALL styling (global, plain CSS)
  components/
    Sidebar.jsx       # left nav / section links
    About.jsx         # about section
    Experience.jsx    # experience section (data-driven)
    Projects.jsx      # project cards; launches the remote viewer
    ProjectViewer.jsx # full-viewport overlay that mounts a remote (React.lazy)
    ErrorBoundary.jsx # guards the shell if a remote fails to load
    icons.jsx         # inline SVG icon components
  data/
    projects.js       # project metadata + federated `load()` + lazy components
    experience.js     # experience entries
```

## Module Federation host contract — do not break remote loading

The shell is a **host**. Its job is to load remotes reliably. Treat the
following as a contract:

- **Remotes are configured in `vite.config.js`.** The `fundDashboard` remote's
  entry URL comes from **`VITE_FUND_REMOTE_URL`** (set per-environment in
  Vercel), defaulting to the production deployment so the app works out of the
  box. Do not hardcode a different URL or remove the env fallback.
- **React and React-DOM are shared as singletons** (`singleton: true`,
  `requiredVersion: '^18.2.0'`). Host and remote must run one React instance —
  do not change React's major version or drop the singleton config without
  coordinating with the remote.
- **Keep `build.target: 'chrome89'`.** Module Federation relies on top-level
  `await`; a lower target breaks remote loading. Do not lower it.
- **Lazy-load remotes.** Remote components are imported via `import('fundDashboard/App')`
  in `src/data/projects.js`, wrapped in `React.lazy`, and rendered inside a
  `<Suspense>` + `<ErrorBoundary>` in `ProjectViewer`. Preserve this so the
  initial load never pays for remote code and a failed remote never unmounts
  the portfolio.
- **Remote-contract changes must be coordinated with the `fund-dashboard` repo.**
  The remote name (`fundDashboard`), the exposed module path (`fundDashboard/App`),
  and shared-dependency versions are a two-sided agreement. Changing either side
  alone will break loading.

## Coding conventions

- **Styling:** add styles to `src/index.css` only, in plain CSS. Match the
  existing BEM-ish class naming (`viewer__bar`, `section__heading`, etc.).
- **JS/JSX only** — no TypeScript, no type annotations, no `.ts`/`.tsx` files.
- **Components:** default-exported function components; hooks for state/effects.
  Keep side-effect cleanup in `useEffect` return values (see `App.jsx`).
- **Data-driven UI:** section content lives in `src/data/*` — extend the data
  files rather than hardcoding content in components where a pattern exists.
- Keep imports relative; no path aliases are configured.

## Commands

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173 (loads prod remote by default)
npm run build        # production build (vite build) — must pass before PR
npm run preview      # serve the production build locally
npm run lint         # ESLint (flat config) over the repo — must pass before PR
npm run lint:fix     # ESLint with autofix
npm run format       # Prettier --write across the repo
npm run format:check # Prettier --check (what CI runs) — must pass before PR
npm test             # Vitest in watch mode
npm run test:run     # Vitest once (what CI runs) — must pass before PR
```

**Testing:** Vitest + React Testing Library (jsdom), config in the `test` block
of `vite.config.js` with `src/test/setup.js` (jest-dom matchers + a `matchMedia`
stub). Tests live next to source as `*.test.{js,jsx}`. The Module Federation
plugin is skipped under Vitest (`process.env.VITEST`) so jsdom can run, and the
`fundDashboard/App` remote specifier is aliased to a local stub
(`src/test/remoteAppStub.jsx`); the remote-failure path overrides that with a
throwing `vi.mock('fundDashboard/App', …)`. Dev/build keep federation active.

To develop against a locally running remote, create `.env` from `.env.example`
and set `VITE_FUND_REMOTE_URL=http://localhost:5001/remoteEntry.js`.

Lint, format, tests, and build are enforced in CI (`.github/workflows/ci.yml`,
job `lint-build`: `npm ci` → `npm run lint` → `npm run format:check` →
`npm run test:run` → `npm run build`). Run these locally before opening a PR.

## Deployment (dev→prod)

This repo (the MF **host**, production **kilianmc.com**) follows the standard
dev→prod flow. See `docs/DEPLOYMENT.md` for the concrete Vercel-dashboard
checklist.

- **Branch model.** Two long-lived branches: **`dev`** (integration) and
  **`main`** (production). **Feature PRs target `dev`.** `main` receives only
  **`dev`→`main` promotion PRs** — never merge a feature branch straight into
  `main`.
- **Vercel deploys.** The **`dev`** branch auto-deploys to a stable **dev URL**;
  **`main`** deploys to **production (kilianmc.com)**. Feature branches get
  ephemeral preview deploys.
- **Per-environment remote URL.** The host loads the `fundDashboard` remote from
  **`VITE_FUND_REMOTE_URL`** (read in `vite.config.js`, prod default preserved).
  Set it per Vercel scope so the dev shell loads the dev remote and prod loads
  prod:
  - **Production** scope →
    `https://ai-portfolio-project1.vercel.app/remoteEntry.js`
  - **Preview** scope (covers the `dev` branch and all non-prod deploys) →
    `https://ai-portfolio-project1-git-dev-kilians-projects-7425dee2.vercel.app/remoteEntry.js`
    (confirmed 2026-07-20; slug uses the team scope). Vercel Deployment
    Protection must stay **off** for previews or the dev remote is SSO-gated —
    see `docs/DEPLOYMENT.md`.
- **Promotion / approval.** Kilian manually tests the **dev URL**, then merges
  the `dev`→`main` promotion PR to ship. Kilian holds the merge gate.
- **Versioning.** Baseline production = **1.0.0**. Dev iterations bump the
  **minor** (`npm run version:dev`: 1.1.0 → 1.2.0 …); each production release
  bumps the **major** and resets minor (`npm run version:release`: → 2.0.0).
  Production carries whole majors; dev carries the in-progress minors.
- **Gate / ruleset.** Both `dev` and `main` require a PR plus a green
  **`lint-build`** CI check (`npm run lint` → `npm run format:check` →
  `npm run test:run` → `npm run build`) before merge.

## Git & PR conventions

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `test:`, `docs:` (plus
  `refactor:`/`perf:` as needed).
- **Branch naming** mirrors the type: `feat/…`, `fix/…`, `chore/…`, `test/…`,
  `docs/…`.
- **PRs:** one focused change per PR. **Feature PRs target `dev`** (production
  `main` receives only `dev`→`main` promotion PRs — see
  **Deployment (dev→prod)** above). Link the issue (`Closes #N`), keep the
  diff tight, and fill in the PR template — including a **preview URL** (Vercel
  deploy preview) and screenshots for any visual change.
- **Never break the MF host contract** (above). If a change touches remote
  loading, shared deps, or the build target, call it out explicitly and confirm
  the remote still mounts.
