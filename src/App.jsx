import { useEffect, useRef, useState } from 'react';
import Sidebar from './components/Sidebar';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import ProjectViewer from './components/ProjectViewer';
import { LinkedInIcon } from './components/icons';

const SECTIONS = ['about', 'experience', 'projects', 'contact'];

export default function App() {
  const [activeSection, setActiveSection] = useState('about');
  const [openProject, setOpenProject] = useState(null);
  const glowRef = useRef(null);

  // Cursor spotlight: move a radial-gradient glow toward the pointer.
  useEffect(() => {
    const el = glowRef.current;
    if (!el || window.matchMedia('(pointer: coarse)').matches) return;
    const onMove = (e) => {
      el.style.setProperty('--glow-x', `${e.clientX}px`);
      el.style.setProperty('--glow-y', `${e.clientY}px`);
    };
    window.addEventListener('pointermove', onMove);
    return () => window.removeEventListener('pointermove', onMove);
  }, []);

  // Highlight the nav item for whichever section is in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    SECTIONS.forEach((id) => {
      const node = document.getElementById(id);
      if (node) observer.observe(node);
    });
    return () => observer.disconnect();
  }, []);

  // Lock background scroll while the remote viewer is open.
  useEffect(() => {
    document.body.style.overflow = openProject ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [openProject]);

  const handleNavigate = (id) => {
    const node = document.getElementById(id);
    if (node) node.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="layout">
      <div className="glow" ref={glowRef} aria-hidden="true" />

      <div className="layout__inner">
        <Sidebar activeSection={activeSection} onNavigate={handleNavigate} />

        <main className="content" id="content">
          <About />
          <Experience />
          <Projects onLaunch={setOpenProject} />

          <section id="contact" className="section" aria-label="Contact">
            <h2 className="section__heading section__heading--mobile">
              <span className="section__num">04.</span> Contact
            </h2>
            <div className="contact">
              <p className="contact__eyebrow">What&rsquo;s next</p>
              <h3 className="contact__title">Get in touch</h3>
              <p className="contact__text">
                I&rsquo;m always happy to talk about frontend architecture,
                microfrontends, or interesting product work. The fastest way to
                reach me is LinkedIn.
              </p>
              <a
                className="btn btn--primary"
                href="https://www.linkedin.com/in/kilian-mateo-136449157/"
                target="_blank"
                rel="noreferrer"
              >
                <LinkedInIcon /> Connect on LinkedIn
              </a>
            </div>
          </section>

          <footer className="footer">
            <p>
              Built by Kilian Mateo — React, Vite &amp; Deployed on Vercel.
            </p>
          </footer>
        </main>
      </div>

      {openProject && (
        <ProjectViewer projectId={openProject} onClose={() => setOpenProject(null)} />
      )}
    </div>
  );
}
