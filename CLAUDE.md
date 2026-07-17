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
npm run dev      # Vite dev server on http://localhost:5173 (loads prod remote by default)
npm run build    # production build (vite build) — must pass before PR
npm run preview  # serve the production build locally
```

To develop against a locally running remote, create `.env` from `.env.example`
and set `VITE_FUND_REMOTE_URL=http://localhost:5001/remoteEntry.js`.

**No lint or test tooling exists yet** (added by issues #2 and #3). Do not
reference `npm run lint`/`npm run test` or claim linting/tests until those land.

## Git & PR conventions

- **Conventional Commits**: `feat:`, `fix:`, `chore:`, `test:`, `docs:` (plus
  `refactor:`/`perf:` as needed).
- **Branch naming** mirrors the type: `feat/…`, `fix/…`, `chore/…`, `test/…`,
  `docs/…`.
- **PRs:** one focused change per PR. Link the issue (`Closes #N`), keep the
  diff tight, and fill in the PR template — including a **preview URL** (Vercel
  deploy preview) and screenshots for any visual change.
- **Never break the MF host contract** (above). If a change touches remote
  loading, shared deps, or the build target, call it out explicitly and confirm
  the remote still mounts.
