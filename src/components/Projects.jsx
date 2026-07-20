import { projects } from '../data/projects';
import { ExternalLinkIcon, CodeIcon, ArrowIcon } from './icons';
import './Projects.scss';

export default function Projects({ onLaunch }) {
  return (
    <section id="projects" className="section" aria-label="Projects">
      <h2 className="section__heading section__heading--mobile">
        <span className="section__num">03.</span> Projects
      </h2>
      <ul className="projects">
        {projects.map((p) => (
          <li key={p.id} className="project-card">
            <p className="project-card__eyebrow">
              Showcase {p.number} ·{' '}
              {p.placeholder ? 'Example' : 'Microfrontend remote'}
            </p>
            <h3 className="project-card__title">{p.title}</h3>
            <p className="project-card__tagline">{p.tagline}</p>
            <p className="project-card__desc">{p.description}</p>

            <ul className="project-card__tech">
              {p.tech.map((t) => (
                <li key={t}>{t}</li>
              ))}
            </ul>

            <div className="project-card__actions">
              {p.placeholder ? (
                <button type="button" className="btn btn--ghost" disabled>
                  Example — coming soon
                </button>
              ) : (
                <>
                  <button
                    type="button"
                    className="btn btn--primary"
                    onClick={() => onLaunch(p.id)}
                  >
                    Launch in portfolio <ArrowIcon />
                  </button>
                  <a
                    className="btn btn--ghost"
                    href={p.liveUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Live site <ExternalLinkIcon />
                  </a>
                  <a
                    className="btn btn--ghost"
                    href={p.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Code <CodeIcon />
                  </a>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
