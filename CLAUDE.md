# CLAUDE.md — portfolio-shell

Guidance for AI agents (and humans) working in this repo. Read it before opening a PR.

## Overview

This repo is **`portfolio-shell`**, the landing site at **kilianmc.com** and the
**host** for a microfrontend portfolio. It renders the personal site (about,
experience, projects, contact) and composes each showcase project — each an
independently built and deployed app — into the shell at runtime.

The shell composes projects via **two integration patterns**:

- **Module Federation** — shared-runtime React remotes, mounted on demand inside
  `ProjectViewer` via `React.lazy`. Today it consumes two: the **`fundDashboard`**
  remote (the [`fund-dashboard`](https://github.com/kilianmc/fund-dashboard) repo)
  and the **`climbTrainer`** remote (the
  [`climb-trainer`](https://github.com/kilianmc/climb-trainer) repo — React 19 +
  TypeScript on a FastAPI/Neon Postgres backend, standalone at
  `climb.kilianmc.com`).
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

- **React 19** (`^19.2.8`) — function components + hooks; one class component
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
vite.config.ts        # MF host config (remotes, shared singletons, dedupe)
tsconfig.json         # strict TS config for the app + vite config
tsconfig.node.json    # TS config for the Node-side vite config
vercel.json           # SPA rewrite (all routes -> /index.html)
.env.example          # per-remote VITE_*_REMOTE_URL documentation
src/
  main.tsx            # ReactDOM root, imports index.scss
  App.tsx             # layout, section nav, opens/closes ProjectViewer
  index.scss          # global styling entry
  types/
    remotes.d.ts      # ambient decls for the `<remote>/App` modules
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

- **Remotes are configured in `vite.config.ts`.** Each entry URL comes from its
  own env var (set per-environment in Vercel) — **`VITE_FUND_REMOTE_URL`** and
  **`VITE_CLIMB_REMOTE_URL`** — defaulting to the production deployment so the app
  works out of the box. Do not hardcode a different URL or remove the env
  fallback.
- **React and React-DOM are shared as singletons** (`singleton: true`,
  `requiredVersion: '^19.0.0'`, `strictVersion: true`). Host and remote must run
  one React instance; any new remote must be on React 19. Do not drop the
  singleton config, and coordinate with the remote — `strictVersion` is **inert
  without `singleton: true`**, so a non-React share that omits the singleton flag
  gets no version checking at all.
- **Strict enforcement follows bootstrap order, not host vs. remote** (verified
  by experiment 2026-08-17). The container that boots **first, with an empty
  shared-module cache**, throws on a range it cannot satisfy, and that throw
  rejects the entry wrapper so the real app entry is never imported — the page is
  blank. Any container initialising **after** the cache is seeded only logs
  `Failed to bridge external shared module` — at least once per shared key — and
  mounts anyway. A forced `^18.0.0` mismatch on `climbTrainer` (re-measured
  2026-08-17) logs **four** such lines against a production build, **one per shared
  key**, all at initial load. **Still grep for that string rather than asserting a
  count**: the same control against the dev server split into two at load (wrapped in
  a `#RUNTIME-015` container-init error) plus four at first card open, per the dev-mode
  behaviour described below. The shell boots first in this topology, so a range this
  repo's own installed React cannot satisfy takes kilianmc.com down, whereas the
  same mistake in a remote only logs when federated — while still blanking that
  remote's own standalone deployment. In a **production build** those lines appear
  at **initial page load** during eager remote init, not when the user opens the
  project. Under
  **`npm run dev`** they do not: since `@module-federation/vite` 1.20.7 the dev
  server materializes a share only once something imports it (`materialize: false`
  on the rest, which the eager host-init loop skips), moving the strict check from
  bootstrap to **first import** — so a violation throws mid-render instead of
  blanking the page at load. Which shares start materialized depends on what the
  module graph has already pulled in. A clean render proves nothing in either
  mode; the console is the gate. Under `strictVersion: false` even the fatal case was only a warning,
  after which MF silently hoisted the highest React into code compiled against
  the other version.
- **A caught bridge failure is not harmless.** It lands on one React today only
  because the first container to boot seeds the page-global share cache and later
  ones rebind to it. Under a different load order, or for a package the shell
  does not share, the fallback is the container's own copy — a genuine second
  React. The remote downloads and evaluates its own unused React chunk either
  way.
- **Bumping React across a major (or onto a canary) needs the range widened
  first.** Installing a React version this repo's own strict range does not
  admit is exactly the fatal case above, so the order is: widen
  `requiredVersion` in both repos → upgrade both → re-narrow to the new major
  with `strictVersion: true`. This is what the tolerant `'^18.2.0 || ^19.0.0'`
  range existed for.
- **Do not reintroduce a `build.target` pin.** Vite 8's default baseline already
  supports the top-level `await` Module Federation needs, so pinning `chrome89`
  only lowers the baseline; the old "MF needs a modern target" justification was
  false.
- **Keep `resolve.dedupe: ['react', 'react-dom']`.** `@vitejs/plugin-react` 6 no
  longer adds it, and duplicate React under federation is the failure it
  prevents.
- **Lazy-load remotes.** Remote components are imported via
  `import('<remote>/App')` in `src/data/projects.ts`, wrapped in `React.lazy`, and
  rendered inside a `<Suspense>` + `<ErrorBoundary>` in `ProjectViewer`. Preserve
  this so the initial load never pays for remote code and a failed remote never
  unmounts the portfolio. Both exposed modules are typed via
  `src/types/remotes.d.ts` (neither remote ships federated types — `dts: false`).
- **Remote-contract changes must be coordinated with the remote's repo.** The
  remote name (`fundDashboard`, `climbTrainer`), the exposed module path
  (`<name>/App`), and shared-dependency versions are a two-sided agreement.
  Changing either side alone will break loading.
- **The `shared` block lists two keys; all three containers register four.** The
  plugin expands a shared package to the subpaths the module graph imports, so this
  host's `react`/`react-dom` become **`react`, `react/jsx-runtime`, `react-dom`,
  `react-dom/client`** — every one `singleton` + `^19.0.0` + `strictVersion: true`,
  and so do `fundDashboard` (which declares two, like this host) and `climbTrainer`
  (which declares the scoped pair explicitly). Measured 2026-08-17 in the built
  `localSharedImportMap` and in
  `__FEDERATION__.__INSTANCES__[*].shareScopeMap.default`: same four keys in all
  three, each provided `from: 'shell'`. **Whether the explicit scoped pair is
  load-bearing is untested here** — `climb-trainer`'s config says it is, on an older
  plugin version — so do not add or remove those declarations on the strength of this
  bullet. What this bullet is for: `react/jsx-runtime` and `react-dom/client` **are**
  shared, so the "a package the shell does not share gets a second React" warning
  above does not apply to them.
- **Cross-origin verification is only ever the console.** Against a locally built
  `climbTrainer` (2026-08-17, dev server and production build): zero bridge failures,
  zero page errors, no rules outside `.ct-app`. Deliberately **no React-instance
  count** here — counting `__reactFiber$` suffixes reads `1` in the broken arm too
  (the remote never creates a renderer), and the share-provider dump and the remote's
  own React chunk requests were also measured identical in both arms. Still owed
  against the deployed remote once `climb-trainer` promotes to production.
- **`climbTrainer` scopes all of its CSS under `.ct-app` and renders absolute
  `https://climb.kilianmc.com/…` hrefs** in the federated mount, so nothing leaks
  into the shell's styles and a cmd-click leaves for the standalone app instead of
  404-ing on kilianmc.com. Both are that repo's contract, asserted by its tests.

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
plugin is skipped under Vitest (`process.env.VITEST`) so jsdom can run, and every
`<remote>/App` specifier is aliased to a local stub
(`src/test/remoteAppStub.tsx`); the remote-failure path overrides that with a
throwing `vi.mock('fundDashboard/App', …)`. Dev/build keep federation active.
**A new remote needs its alias added there too**, or Vite's import analysis fails
on the bare specifier under test.

To develop against a locally running remote, create `.env` from `.env.example`
and point that remote's URL at it, e.g.
`VITE_FUND_REMOTE_URL=http://localhost:5001/remoteEntry.js`. A cross-origin local
run needs `Access-Control-Allow-Origin` on the remote's `/remoteEntry.js` **and**
`/assets/*` — `remoteEntry.js` statically imports a chunk from `/assets/`, so
without it the first `import()` rejects.

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
- **Per-environment remote URLs.** The host reads each remote's entry from its own
  env var in `vite.config.ts` (prod default preserved). Set them per Vercel scope
  so the dev shell loads the dev remote and prod loads prod:
  - **`VITE_FUND_REMOTE_URL`** — Production →
    `https://ai-portfolio-project1.vercel.app/remoteEntry.js`; Preview (the `dev`
    branch and all non-prod deploys) →
    `https://ai-portfolio-project1-git-dev-kilians-projects-7425dee2.vercel.app/remoteEntry.js`
    (confirmed 2026-07-20; slug uses the team scope). Vercel Deployment
    Protection must stay **off** for previews or the dev remote is SSO-gated —
    see `docs/DEPLOYMENT.md`.
  - **`VITE_CLIMB_REMOTE_URL`** — `https://climb.kilianmc.com/remoteEntry.js` in
    **both** scopes. `climb-trainer` keeps Deployment Protection **on** for its
    previews on purpose, so its branch alias answers `302 → vercel.com/sso-api`
    and is unusable cross-origin; the dev shell consumes the production climb
    remote until that changes. Since that repo's v2.0.0 promotion (2026-08-18) the URL
    answers `200 application/javascript` with `access-control-allow-origin: *`.
- ⚠️ **Promote a new remote to production BEFORE the host that consumes it** — the
  general rule, and the reason 3.3.0 waited for `climb-trainer` v2.0.0 (cleared
  2026-08-18). A production build preloads every remote entry at page load, so a remote
  whose `main` is still pre-app serves its SPA rewrite and the page logs **one** error on
  load (the browser refusing the module for its MIME type), plus
  `#RUNTIME-008 Failed to load script resources` **once per card open** — `1 + N`, not a
  fixed 2. Measured 2026-08-17 against `200 text/html`. The portfolio still renders and
  the card shows its `ErrorBoundary`, so it is cosmetic — but cosmetic _on kilianmc.com_.
- ⚠️ **"The portfolio survives a broken remote" holds only for remotes that fail
  FAST.** A remote entry that **hangs** leaves kilianmc.com **completely blank** —
  `#root` empty, still blank at 15 s — because eager remote init gates first paint on
  every entry resolving; a slow one delays first paint by however long it takes. This
  is **pre-existing and architectural, not introduced by any one remote**: measured
  2026-08-17 with the climb entry hanging and again with the _fund_ entry hanging, both
  identical. What each new remote does add is one more third-party origin that can do
  it. No timeout is being added here — if that becomes a priority it is its own change
  (a bounded `loadRemote` timeout, or moving remote init off the critical path).
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
