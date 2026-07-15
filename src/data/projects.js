import { lazy } from 'react';

// Each showcase project is a Module Federation remote. `load` is a dynamic
// import of the remote's exposed component, wrapped in React.lazy at the
// component that renders it. `liveUrl`/`repoUrl` point at the standalone
// deployment and its source.
export const projects = [
  {
    id: 'fund-dashboard',
    number: '01',
    title: 'Fund Portfolio Dashboard',
    tagline: 'A responsive fund analytics dashboard, loaded here as a microfrontend.',
    description:
      'Built from a single-file prototype into a component-based React app: an indexed performance chart with a benchmark and time-range toggle, headline KPIs, a scrollable holdings table, and an allocation donut. Runtime light/dark theming. It runs standalone and is exposed as a Module Federation remote — the panel below is that remote loaded live into this portfolio.',
    tech: ['React', 'Vite', 'Chart.js', 'SCSS', 'Module Federation'],
    liveUrl: 'https://ai-portfolio-project1.vercel.app',
    repoUrl: 'https://github.com/kilianmc/fund-dashboard',
    // Federated import — resolved by @module-federation/vite at runtime.
    load: () => import('fundDashboard/App'),
  },
];

// Pre-create the lazy components keyed by project id so they are stable
// across renders (React.lazy must not be called inside render).
export const lazyProjectComponents = Object.fromEntries(
  projects.map((p) => [p.id, lazy(p.load)])
);
