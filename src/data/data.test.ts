import { describe, it, expect } from 'vitest';
import { projects, lazyProjectComponents } from './projects';
import type { RemoteProject, EmbeddedProject } from './projects';
import { experience } from './experience';

describe('projects data', () => {
  it('contains the fund-dashboard remote entry', () => {
    const fund = projects.find((p) => p.id === 'fund-dashboard') as
      RemoteProject | undefined;
    expect(fund).toBeDefined();
    expect(fund!.kind).toBe('remote');
    // Title/tech are editorial copy — assert only that they're present, not
    // their exact wording, so copy tweaks don't break the data contract test.
    expect(fund!.title.length).toBeGreaterThan(0);
    expect(fund!.liveUrl).toBe('https://ai-portfolio-project1.vercel.app');
    expect(fund!.repoUrl).toBe('https://github.com/kilianmc/fund-dashboard');
    expect(fund!.tech.length).toBeGreaterThan(0);
    expect(typeof fund!.load).toBe('function');
  });

  it('contains the photography-portfolio embedded (iframe) entry', () => {
    const photo = projects.find((p) => p.id === 'photography-portfolio') as
      EmbeddedProject | undefined;
    expect(photo).toBeDefined();
    expect(photo!.kind).toBe('embedded');
    // Title/tech are editorial copy — assert presence, not exact wording.
    expect(photo!.title.length).toBeGreaterThan(0);
    expect(photo!.embedUrl).toBe('https://artlaia.pages.dev');
    expect(photo!.liveUrl).toBe('https://artlaia.pages.dev');
    expect(photo!.repoUrl).toBe(
      'https://github.com/kilianmc/photography-portfolio',
    );
    expect(photo!.tech.length).toBeGreaterThan(0);
    // Embedded projects are iframe-composed, not federated — no `load`.
    expect('load' in photo!).toBe(false);
  });

  it('has a non-empty, well-shaped entry for every project', () => {
    expect(projects.length).toBeGreaterThan(0);
    for (const p of projects) {
      expect(typeof p.id).toBe('string');
      expect(p.id.length).toBeGreaterThan(0);
      expect(p.title.length).toBeGreaterThan(0);
      expect(p.tagline.length).toBeGreaterThan(0);
      expect(p.description.length).toBeGreaterThan(0);
      expect(Array.isArray(p.tech)).toBe(true);
      expect(p.tech.length).toBeGreaterThan(0);
      // The default project set is real (examples are opt-in and never enabled
      // in tests); real projects carry live/repo links and a kind-specific
      // integration handle.
      if (p.kind === 'remote') {
        expect(p.liveUrl).toMatch(/^https?:\/\//);
        expect(p.repoUrl).toMatch(/^https?:\/\//);
        expect(typeof p.load).toBe('function');
      } else if (p.kind === 'embedded') {
        expect(p.liveUrl).toMatch(/^https?:\/\//);
        expect(p.repoUrl).toMatch(/^https?:\/\//);
        expect(p.embedUrl).toMatch(/^https?:\/\//);
      }
    }
  });

  it('has unique project ids', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exposes a lazy component for every federated remote (only)', () => {
    const remotes = projects.filter((p) => p.kind === 'remote');
    for (const p of remotes) {
      const Comp = lazyProjectComponents[p.id];
      expect(Comp).toBeDefined();
      // React.lazy returns an object tagged as a lazy element type.
      expect(Comp.$$typeof).toBe(Symbol.for('react.lazy'));
    }
    // Embedded and placeholder projects have no `load`, so they must not get a
    // lazy component.
    expect(Object.keys(lazyProjectComponents)).toHaveLength(remotes.length);
    expect(lazyProjectComponents['photography-portfolio']).toBeUndefined();
  });
});

describe('experience data', () => {
  it('lists companies most-recent-first with well-shaped entries', () => {
    expect(experience.length).toBe(3);
    expect(experience[0].company).toBe('Cognizant Netcentric');

    for (const entry of experience) {
      expect(entry.company.length).toBeGreaterThan(0);
      expect(entry.range).toMatch(/\d{4}/);
      expect(entry.location.length).toBeGreaterThan(0);
      expect(Array.isArray(entry.roles)).toBe(true);
      expect(entry.roles.length).toBeGreaterThan(0);
      expect(Array.isArray(entry.tech)).toBe(true);
      expect(entry.tech.length).toBeGreaterThan(0);
    }
  });

  it('gives every role a title and range, and non-empty bullets where present', () => {
    for (const entry of experience) {
      for (const role of entry.roles) {
        expect(role.title.length).toBeGreaterThan(0);
        expect(role.range.length).toBeGreaterThan(0);
        // A role carries a one-line desc and/or a bullets list.
        expect(role.desc !== undefined || role.bullets !== undefined).toBe(
          true,
        );
        if (role.bullets !== undefined) {
          expect(Array.isArray(role.bullets)).toBe(true);
          expect(role.bullets.length).toBeGreaterThan(0);
          for (const b of role.bullets) {
            expect(typeof b).toBe('string');
            expect(b.length).toBeGreaterThan(0);
          }
        }
      }
    }
  });
});
