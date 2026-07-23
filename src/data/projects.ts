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

// The shell composes projects via two integration patterns, plus HTML-only
// example cards. Each variant is discriminated by `kind`:
// - 'remote'      — a Module Federation remote (shared-runtime React), loaded
//                   via `load()` (React.lazy) into the viewer.
// - 'embedded'    — a fully independent app of any stack, composed via an
//                   iframe (`embedUrl`) — the framework-agnostic microfrontend.
// - 'placeholder' — an HTML-only example card (layout preview only).

// A real showcase project backed by a Module Federation remote. `load` is a
// dynamic import of the remote's exposed component (wrapped in React.lazy);
// `liveUrl`/`repoUrl` point at the standalone deployment and its source.
export interface RemoteProject extends BaseProject {
  kind: 'remote';
  liveUrl: string;
  repoUrl: string;
  load: () => Promise<{ default: ComponentType }>;
}

// A real showcase project that is a fully independent app (any stack), composed
// into the shell via an iframe. `embedUrl` is the deployed site loaded inside
// the viewer; `liveUrl`/`repoUrl` point at that deployment and its source.
export interface EmbeddedProject extends BaseProject {
  kind: 'embedded';
  embedUrl: string;
  liveUrl: string;
  repoUrl: string;
}

// An HTML-only example card with no project behind it (layout preview only).
export interface PlaceholderProject extends BaseProject {
  kind: 'placeholder';
}

export type Project = RemoteProject | EmbeddedProject | PlaceholderProject;

// The real, production-visible projects — one of each integration pattern.
const realProjects: (RemoteProject | EmbeddedProject)[] = [
  {
    id: 'fund-dashboard',
    kind: 'remote',
    number: '01',
    title: 'Funds Portfolio Dashboard',
    tagline:
      'A responsive funds analytics dashboard, loaded here as a microfrontend.',
    description:
      'Built from a prototype into a component-based React app: it shows an indexed performance chart with a benchmark and time-range toggle, some headline KPIs, a scrollable holdings table, and an allocation donut. It runs standalone and is exposed as a Module Federation remote.',
    tech: ['React', 'Vite', 'Chart.js', 'SCSS'],
    liveUrl: 'https://ai-portfolio-project1.vercel.app',
    repoUrl: 'https://github.com/kilianmc/fund-dashboard',
    // Federated import — resolved by @module-federation/vite at runtime.
    load: () => import('fundDashboard/App'),
  },
  {
    id: 'photography-portfolio',
    kind: 'embedded',
    number: '02',
    title: 'Photography Portfolio',
    tagline:
      'A quality photography portfolio — an independently built Astro site, loaded here via iframe integration.',
    description:
      'A warm, content-driven photography portfolio built with Astro, Tailwind and Markdown content collections. Has an integrated headless CMS so the artist can manage its content. This is a fully independent app of a different stack — composed into the portfolio via a framework-agnostic microfrontend pattern.',
    tech: ['Astro', 'TypeScript', 'Tailwind CSS', 'Sveltia CMS'],
    embedUrl: 'https://artlaia.pages.dev',
    liveUrl: 'https://artlaia.pages.dev',
    repoUrl: 'https://github.com/kilianmc/photography-portfolio',
  },
];

// HTML-only example cards for previewing layout/hover with a fuller grid.
// NOT shown in production. Enable locally with VITE_SHOW_EXAMPLE_PROJECTS=true
// (add it to a .env.local file, or run: VITE_SHOW_EXAMPLE_PROJECTS=true npm run dev).
const exampleProjects: PlaceholderProject[] = [
  {
    id: 'example-chat',
    kind: 'placeholder',
    number: '03',
    title: 'Realtime Chat',
    tagline: 'Example card — not a real project (layout/hover preview only).',
    description:
      'Placeholder used to see how the projects section and hover treatment behave with several cards. No live deployment or remote behind it.',
    tech: ['React', 'WebSocket', 'Node'],
  },
  {
    id: 'example-notes',
    kind: 'placeholder',
    number: '04',
    title: 'Markdown Notes',
    tagline: 'Example card — not a real project (layout/hover preview only).',
    description:
      'Placeholder used to see how the projects section and hover treatment behave with several cards. No live deployment or remote behind it.',
    tech: ['TypeScript', 'IndexedDB', 'Vite'],
  },
  {
    id: 'example-weather',
    kind: 'placeholder',
    number: '05',
    title: 'Weather Widget',
    tagline: 'Example card — not a real project (layout/hover preview only).',
    description:
      'Placeholder used to see how the projects section and hover treatment behave with several cards. No live deployment or remote behind it.',
    tech: ['React', 'REST API'],
  },
];

const showExamples = import.meta.env.VITE_SHOW_EXAMPLE_PROJECTS === 'true';

// Examples are appended only when explicitly enabled — never in production.
export const projects: Project[] = showExamples
  ? [...realProjects, ...exampleProjects]
  : realProjects;

// Pre-create the lazy components keyed by project id so they are stable
// across renders (React.lazy must not be called inside render). Only Module
// Federation remotes have a `load` to import — embedded (iframe) and
// placeholder cards have no remote and are skipped here.
export const lazyProjectComponents: Record<
  string,
  LazyExoticComponent<ComponentType>
> = Object.fromEntries(
  projects
    .filter((p): p is RemoteProject => p.kind === 'remote')
    .map((p) => [p.id, lazy(p.load)]),
);
