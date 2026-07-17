import { describe, it, expect } from 'vitest';
import { projects, lazyProjectComponents } from './projects';
import { experience } from './experience';

describe('projects data', () => {
  it('contains the fund-dashboard remote entry', () => {
    const fund = projects.find((p) => p.id === 'fund-dashboard');
    expect(fund).toBeDefined();
    expect(fund.title).toBe('Fund Portfolio Dashboard');
    expect(fund.liveUrl).toBe('https://ai-portfolio-project1.vercel.app');
    expect(fund.repoUrl).toBe('https://github.com/kilianmc/fund-dashboard');
    expect(fund.tech).toContain('Module Federation');
    expect(typeof fund.load).toBe('function');
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
      expect(p.liveUrl).toMatch(/^https?:\/\//);
      expect(p.repoUrl).toMatch(/^https?:\/\//);
      expect(typeof p.load).toBe('function');
    }
  });

  it('has unique project ids', () => {
    const ids = projects.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('exposes a lazy component keyed by every project id', () => {
    for (const p of projects) {
      const Comp = lazyProjectComponents[p.id];
      expect(Comp).toBeDefined();
      // React.lazy returns an object tagged as a lazy element type.
      expect(Comp.$$typeof).toBe(Symbol.for('react.lazy'));
    }
    expect(Object.keys(lazyProjectComponents)).toHaveLength(projects.length);
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
