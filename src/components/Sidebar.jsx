import { GitHubIcon, LinkedInIcon } from './icons';

const NAV = [
  { id: 'about', label: 'About' },
  { id: 'experience', label: 'Experience' },
  { id: 'projects', label: 'Projects' },
  { id: 'contact', label: 'Contact' },
];

const SOCIALS = [
  { label: 'GitHub', href: 'https://github.com/kilianmc', Icon: GitHubIcon },
  { label: 'LinkedIn', href: 'https://www.linkedin.com/in/kilian-mateo-136449157/', Icon: LinkedInIcon },
];

export default function Sidebar({ activeSection, onNavigate }) {
  return (
    <header className="sidebar">
      <div className="sidebar__intro">
        <h1 className="sidebar__name">Kilian Mateo</h1>
        <h2 className="sidebar__role">Software Engineer</h2>
        <p className="sidebar__tagline">
          I build modular, resilient web experiences — assembling independent
          frontends into one cohesive product.
        </p>
      </div>

      <nav className="sidebar__nav" aria-label="In-page navigation">
        <ul>
          {NAV.map((item, i) => (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                className={`sidebar__nav-link${
                  activeSection === item.id ? ' is-active' : ''
                }`}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.id);
                }}
              >
                <span className="sidebar__nav-index">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="sidebar__nav-line" />
                <span className="sidebar__nav-text">{item.label}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <ul className="sidebar__socials" aria-label="Social links">
        {SOCIALS.map(({ label, href, Icon }) => (
          <li key={label}>
            <a href={href} target="_blank" rel="noreferrer" aria-label={label} title={label}>
              <Icon />
            </a>
          </li>
        ))}
      </ul>
    </header>
  );
}
