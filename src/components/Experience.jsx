import { experience } from '../data/experience';
import { ExternalLinkIcon } from './icons';

export default function Experience() {
  return (
    <section id="experience" className="section" aria-label="Experience">
      <h2 className="section__heading section__heading--mobile">
        <span className="section__num">02.</span> Experience
      </h2>
      <ol className="xp">
        {experience.map((job, i) => (
          <li className="xp__item" key={`${job.company}-${i}`}>
            <p className="xp__range">{job.range}</p>
            <div className="xp__body">
              <h3 className="xp__company-head">
                {job.url ? (
                  <a href={job.url} target="_blank" rel="noreferrer">
                    {job.company} <ExternalLinkIcon />
                  </a>
                ) : (
                  job.company
                )}
              </h3>
              {job.location && <p className="xp__location">{job.location}</p>}

              <ul className="xp__roles">
                {job.roles.map((r, k) => (
                  <li className="xp__role-item" key={k}>
                    <div className="xp__role-head">
                      <span className="xp__roles-title">{r.title}</span>
                      <span className="xp__roles-range">{r.range}</span>
                    </div>
                    {r.desc && <p className="xp__role-desc">{r.desc}</p>}
                    {r.bullets?.length > 0 && (
                      <ul className="xp__bullets">
                        {r.bullets.map((b, j) => (
                          <li key={j}>{b}</li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ul>

              {job.tech?.length > 0 && (
                <ul className="xp__tech">
                  {job.tech.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
