import { lazy } from 'react';
import type { ComponentType, LazyExoticComponent } from 'react';

// Fields shared by every project card.
interface BaseProject {
  id: string;
  number: string;
  title: string;
  tagline: string;
  description: string;
  tech: string[];
}

// A real showcase project backed by a Module Federation remote. `load` is a
// dynamic import of the remote's exposed component (wrapped in React.lazy);
// `liveUrl`/`repoUrl` point at the standalone deployment and its source.
export interface RemoteProject extends BaseProject {
  liveUrl: string;
  repoUrl: string;
  load: () => Promise<{ default: ComponentType }>;
  placeholder?: false;
}

// An HTML-only example card with no remote behind it (layout preview only).
export interface PlaceholderProject extends BaseProject {
  placeholder: true;
}

export type Project = RemoteProject | PlaceholderProject;

// Each showcase project is a Module Federation remote. `load` is a dynamic
// import of the remote's exposed component, wrapped in React.lazy at the
// component that renders it. `liveUrl`/`repoUrl` point at the standalone
// deployment and its source.
const realProjects: RemoteProject[] = [
  {
    id: 'fund-dashboard',
    number: '01',
    title: 'Fund Portfolio Dashboard',
    tagline:
      'A responsive fund analytics dashboard, loaded here as a microfrontend.',
    description:
      'Built from a single-file prototype into a component-based React app: an indexed performance chart with a benchmark and time-range toggle, headline KPIs, a scrollable holdings table, and an allocation donut. Runtime light/dark theming. It runs standalone and is exposed as a Module Federation remote — the panel below is that remote loaded live into this portfolio.',
    tech: ['React', 'Vite', 'Chart.js', 'SCSS', 'Module Federation'],
    liveUrl: 'https://ai-portfolio-project1.vercel.app',
    repoUrl: 'https://github.com/kilianmc/fund-dashboard',
    // Federated import — resolved by @module-federation/vite at runtime.
    load: () => import('fundDashboard/App'),
  },
];

// HTML-only example cards for previewing layout/hover with a fuller grid.
// NOT shown in production. Enable locally with VITE_SHOW_EXAMPLE_PROJECTS=true
// (add it to a .env.local file, or run: VITE_SHOW_EXAMPLE_PROJECTS=true npm run dev).
const exampleProjects: PlaceholderProject[] = [
  {
    id: 'example-chat',
    number: '02',
    title: 'Realtime Chat',
    tagline: 'Example card — not a real project (layout/hover preview only).',
    description:
      'Placeholder used to see how the projects section and hover treatment behave with several cards. No live deployment or remote behind it.',
    tech: ['React', 'WebSocket', 'Node'],
    placeholder: true,
  },
  {
    id: 'example-notes',
    number: '03',
    title: 'Markdown Notes',
    tagline: 'Example card — not a real project (layout/hover preview only).',
    description:
      'Placeholder used to see how the projects section and hover treatment behave with several cards. No live deployment or remote behind it.',
    tech: ['TypeScript', 'IndexedDB', 'Vite'],
    placeholder: true,
  },
  {
    id: 'example-weather',
    number: '04',
    title: 'Weather Widget',
    tagline: 'Example card — not a real project (layout/hover preview only).',
    description:
      'Placeholder used to see how the projects section and hover treatment behave with several cards. No live deployment or remote behind it.',
    tech: ['React', 'REST API'],
    placeholder: true,
  },
];

const showExamples = import.meta.env.VITE_SHOW_EXAMPLE_PROJECTS === 'true';

// Examples are appended only when explicitly enabled — never in production.
export const projects: Project[] = showExamples
  ? [...realProjects, ...exampleProjects]
  : realProjects;

// Pre-create the lazy components keyed by project id so they are stable
// across renders (React.lazy must not be called inside render). Placeholder
// cards have no remote to load, so they are skipped here.
export const lazyProjectComponents: Record<
  string,
  LazyExoticComponent<ComponentType>
> = Object.fromEntries(
  projects
    .filter((p): p is RemoteProject => !p.placeholder)
    .map((p) => [p.id, lazy(p.load)]),
);
