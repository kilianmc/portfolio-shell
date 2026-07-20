# Portfolio Shell

The **host** application for my microfrontend portfolio. It renders the landing
experience (about, projects, contact) and loads each showcase project as an
independently deployed **Module Federation remote** at runtime.

- **Live:** https://kilianmc.com
- **Architecture:** `shell` (this repo) is the host; each project is its own
  repo + Vercel deployment, exposed as a remote and stitched in on demand.

## Showcase remotes

| Project                  | Remote          | Repo                                                         | Live                                     |
| ------------------------ | --------------- | ------------------------------------------------------------ | ---------------------------------------- |
| Fund Portfolio Dashboard | `fundDashboard` | [fund-dashboard](https://github.com/kilianmc/fund-dashboard) | https://ai-portfolio-project1.vercel.app |

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

## Tech

React 18 · TypeScript (strict) · Vite 8 · `@module-federation/vite` · SCSS.
Deployed on Vercel.
