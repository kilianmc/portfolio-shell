# Portfolio Shell

The **host** application for my microfrontend portfolio. It renders the landing
experience (about, experience, projects, contact) and loads each showcase
project as an independently deployed **Module Federation remote** at runtime.

- **Live:** https://kilianmc.com
- **Architecture:** `shell` (this repo) is the host; each project is its own
  repo + Vercel deployment, exposed as a remote and stitched in on demand.
- **Dev Journal:** the chronological build log across both projects is rendered
  on the site under **Dev Journal**, or read the source at
  [`docs/DEV_JOURNAL.md`](docs/DEV_JOURNAL.md).

## Showcase remotes

| Project                  | Remote          | Repo                                                         | Live                                     |
| ------------------------ | --------------- | ------------------------------------------------------------ | ---------------------------------------- |
| Fund Portfolio Dashboard | `fundDashboard` | [fund-dashboard](https://github.com/kilianmc/fund-dashboard) | https://ai-portfolio-project1.vercel.app |

## Tech

React 18 · **TypeScript (strict)** · Vite 8 · `@module-federation/vite` · SCSS ·
Vitest + React Testing Library · Vercel Web Analytics. Deployed on Vercel.

> **Typed host, JS remote — on purpose.** This shell is the deliberately
> rigorous, strictly-typed counterpart to the `fund-dashboard` remote, which
> **intentionally stays plain JS** (the fast/simple "AI-as-Copilot" project). The
> two repos are a deliberate contrast in engineering approach.

## Getting started

```bash
npm install
npm run dev      # http://localhost:5173  (loads the production remote by default)
npm run build
npm run preview
```

### Pointing at a local remote

By default the shell loads the fund dashboard from its production URL. To develop
against a locally running remote, create `.env` (see `.env.example`):

```bash
VITE_FUND_REMOTE_URL=http://localhost:5001/remoteEntry.js
```

Then in the fund-dashboard repo: `npm run build:remote` + `npm run serve:remote`.

## Quality gate

All enforced in CI (`.github/workflows/ci.yml`, job `lint-build`) and runnable
locally:

```bash
npm run lint          # ESLint (flat config, typescript-eslint)
npm run typecheck     # tsc --noEmit (strict)
npm run format:check  # Prettier
npm run test:run      # Vitest once
npm run build         # production build (Module Federation host)
```

## Deployment (dev → prod)

Two long-lived branches: **`dev`** (integration) and **`main`** (production).

- **Feature PRs target `dev`.** `main` only ever receives `dev`→`main` promotion
  PRs, merged after the dev deploy is tested.
- **Vercel:** `dev` auto-deploys to a stable dev URL; `main` deploys to
  production (kilianmc.com). The `fundDashboard` remote URL is set per Vercel
  environment via `VITE_FUND_REMOTE_URL`, so the dev shell loads the dev remote
  and prod loads prod.
- **Versioning:** production baseline `1.0.0`; each dev iteration bumps the
  **minor** (`npm run version:dev`), each production release bumps the **major**
  and resets the minor (`npm run version:release`).
- **Gates:** both branches require a PR + a green `lint-build` check.

See [`docs/DEPLOYMENT.md`](docs/DEPLOYMENT.md) for the Vercel dashboard checklist.
