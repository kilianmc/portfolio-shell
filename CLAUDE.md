# CLAUDE.md — portfolio-shell

Guidance for AI agents (and humans) working in this repo. Read it before opening a PR.

## Overview

This repo is **`portfolio-shell`**, the landing site at **kilianmc.com** and the
**host** for a microfrontend portfolio. It renders the personal site (about,
experience, projects, contact) and composes each showcase project — each an
independently built and deployed app — into the shell at runtime.

The shell composes projects via **two integration patterns**:

- **Module Federation** — shared-runtime React remotes, mounted on demand inside
  `ProjectViewer` via `React.lazy`. Today it consumes one remote, the
  **`fundDashboard`** remote (the
  [`fund-dashboard`](https://github.com/kilianmc/fund-dashboard) repo).
- **iframe integration** — the framework-agnostic microfrontend pattern: a fully
  independent, fully isolated app of _any_ stack, composed into the shell inside
  an `<iframe>`. Today this is the **photography-portfolio** — an Astro static
  site (Tailwind v4, Cloudflare Pages, live at
  [artlaia.pages.dev](https://artlaia.pages.dev)) — which is not a React MF
  remote and so is embedded rather than federated.

Both open in the same `ProjectViewer` overlay; the data model discriminates the
two (plus HTML-only example cards) via a `kind` field in `src/data/projects.ts`.

This repo runs an **AI-as-Agent** development loop: issues are implemented by
agents that open focused PRs. Keep changes small and reviewable.

## Stack

- **React 18** (`^18.2.0`) — function components + hooks; one class component
  (`ErrorBoundary`).
- **TypeScript (strict)** — the whole shell is `.ts`/`.tsx` with
  `strict: true` (see `tsconfig.json`). Type-check with `npm run typecheck`
  (`tsc --noEmit`), enforced in CI. Component props, the `Experience`/`Project`
  data models, and event/ref handlers are typed; `any` is avoided.
- **Vite 8** with `@vitejs/plugin-react`.
- **`@module-federation/vite`** for Module Federation (host role).
- **SCSS** — a global `src/index.scss` plus per-component `.scss` and shared
  partials under `src/styles/`. No CSS modules, no CSS-in-JS.
- **Node** per `.nvmrc` = `24` (LTS; `package.json` engines: `>=22.12.0`).
- Deployed on **Vercel** via Git integration (SPA rewrite in `vercel.json`).

> **Why TypeScript here (and _not_ in `fund-dashboard`)?** The
> `fund-dashboard` remote intentionally stays **plain JS** — it is the
> fast/simple copilot-style project. The shell is deliberately the typed,
> more rigorous counterpart, so the two repos form a deliberate contrast in
> engineering approach. Because the remote ships no types, federated type
> generation is disabled (`dts: false`) and the exposed remote module is typed
> locally in `src/types/remotes.d.ts` instead.

## Project structure

```
index.html            # entry HTML; loads /src/main.tsx, Google Fonts
vite.config.ts        # MF host config (remotes, shared singletons, build target)
tsconfig.json         # strict TS config for the app + vite config
tsconfig.node.json    # TS config for the Node-side vite config
vercel.json           # SPA rewrite (all routes -> /index.html)
.env.example          # VITE_FUND_REMOTE_URL documentation
src/
  main.tsx            # ReactDOM root, imports index.scss
  App.tsx             # layout, section nav, opens/closes ProjectViewer
  index.scss          # global styling entry
  types/
    remotes.d.ts      # ambient decl for the `fundDashboard/App` remote module
  styles/             # shared SCSS partials (_variables, _mixins)
  components/
    Sidebar.tsx       # left nav / section links
    About.tsx         # about section
    Experience.tsx    # experience section (data-driven)
    Projects.tsx      # project cards; launches the viewer (remote or iframe)
    ProjectViewer.tsx # full-viewport overlay: mounts a remote (React.lazy) OR an <iframe>
    ErrorBoundary.tsx # guards the shell if a remote fails to load
    icons.tsx         # inline SVG icon components
    *.scss            # per-component styles
  data/
    projects.ts       # project metadata + `kind`-discriminated types (remote | embedded | placeholder) + federated `load()` + lazy components
    experience.ts     # experience entries + `Experience`/`Role` types
```

## Integration patterns — how projects are composed

The shell composes projects two ways, discriminated by the `kind` field on each
entry in `src/data/projects.ts`:

- **`kind: 'remote'`** — a Module Federation remote (shared-runtime React),
  loaded via `load()` (a dynamic `import()` wrapped in `React.lazy`) and rendered
  inside `ProjectViewer` behind `<Suspense>` + `<ErrorBoundary>`. Governed by the
  MF host contract below.
- **`kind: 'embedded'`** — a fully independent app of _any_ stack (e.g. the Astro
  photography-portfolio), composed via an `<iframe src={embedUrl}>` in
  `ProjectViewer`. It is fully isolated: no shared runtime, no federation, no env
  var — `embedUrl` is a constant in `projects.ts`. This is the framework-agnostic
  microfrontend pattern.
- **`kind: 'placeholder'`** — an HTML-only example card (layout preview only),
  hidden in production behind `VITE_SHOW_EXAMPLE_PROJECTS`.

Only `remote` projects get a `React.lazy` entry in `lazyProjectComponents`;
`embedded` and `placeholder` have no `load` and are excluded.

## Module Federation host contract — do not break remote loading

The shell is a **host**. For federated (`kind: 'remote'`) projects, its job is to
load remotes reliably. Treat the following as a contract:

- **Remotes are configured in `vite.config.ts`.** The `fundDashboard` remote's
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
  in `src/data/projects.ts`, wrapped in `React.lazy`, and rendered inside a
  `<Suspense>` + `<ErrorBoundary>` in `ProjectViewer`. Preserve this so the
  initial load never pays for remote code and a failed remote never unmounts
  the portfolio. The `fundDashboard/App` module is typed via
  `src/types/remotes.d.ts` (the remote ships no federated types — `dts: false`).
- **Remote-contract changes must be coordinated with the `fund-dashboard` repo.**
  The remote name (`fundDashboard`), the exposed module path (`fundDashboard/App`),
  and shared-dependency versions are a two-sided agreement. Changing either side
  alone will break loading.

## Coding conventions

- **Styling:** SCSS. Component styles live next to the component (`About.scss`,
  etc.); shared tokens/mixins go in `src/styles/`. Match the existing BEM-ish
  class naming (`viewer__bar`, `section__heading`, etc.).
- **TypeScript (strict):** all source is `.ts`/`.tsx`. Add real types (prop
  interfaces, typed data models, event/ref types); avoid `any` where a real
  type is easy. `npm run typecheck` must pass.
- **Components:** default-exported function components; hooks for state/effects.
  Keep side-effect cleanup in `useEffect` return values (see `App.tsx`).
- **Data-driven UI:** section content lives in `src/data/*` — extend the data
  files rather than hardcoding content in components where a pattern exists.
- Keep imports relative; no path aliases are configured.

## Commands

```bash
npm install
npm run dev          # Vite dev server on http://localhost:5173 (loads prod remote by default)
npm run build        # production build (vite build) — must pass before PR
npm run preview      # serve the production build locally
npm run lint         # ESLint (flat config, typescript-eslint) — must pass before PR
npm run lint:fix     # ESLint with autofix
npm run typecheck    # tsc --noEmit (strict) — must pass before PR
npm run format       # Prettier --write across the repo
npm run format:check # Prettier --check (what CI runs) — must pass before PR
npm test             # Vitest in watch mode
npm run test:run     # Vitest once (what CI runs) — must pass before PR
```

**Testing:** Vitest + React Testing Library (jsdom), config in the `test` block
of `vite.config.ts` with `src/test/setup.ts` (jest-dom matchers + a `matchMedia`
stub). Tests live next to source as `*.test.{ts,tsx}`. The Module Federation
plugin is skipped under Vitest (`process.env.VITEST`) so jsdom can run, and the
`fundDashboard/App` remote specifier is aliased to a local stub
(`src/test/remoteAppStub.tsx`); the remote-failure path overrides that with a
throwing `vi.mock('fundDashboard/App', …)`. Dev/build keep federation active.

To develop against a locally running remote, create `.env` from `.env.example`
and set `VITE_FUND_REMOTE_URL=http://localhost:5001/remoteEntry.js`.

Lint, typecheck, format, tests, and build are enforced in CI
(`.github/workflows/ci.yml`, job `lint-build`: `npm ci` → `npm run lint` →
`npm run typecheck` → `npm run format:check` → `npm run test:run` →
`npm run build`). Run these locally before opening a PR.

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
  **`lint-build`** CI check (`npm run lint` → `npm run typecheck` →
  `npm run format:check` → `npm run test:run` → `npm run build`) before merge.

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
