import { useEffect, useState } from 'react';
import Sidebar from './components/Sidebar';
import About from './components/About';
import Experience from './components/Experience';
import Projects from './components/Projects';
import ProjectViewer from './components/ProjectViewer';
import { LinkedInIcon } from './components/icons';
import { Analytics } from '@vercel/analytics/react';

const SECTIONS = ['about', 'experience', 'projects', 'contact'];

export default function App() {
  const [activeSection, setActiveSection] = useState('about');
  const [openProject, setOpenProject] = useState<string | null>(null);

  // Highlight the nav item for whichever section is currently in view.
  // Scroll-position based (not IntersectionObserver): a reference line at 40%
  // of the viewport picks the last section whose top has passed it, which stays
  // correct scrolling in both directions and through tall sections. At the very
  // bottom of the page the last (short) section is forced active.
  useEffect(() => {
    const getActiveSection = () => {
      const doc = document.documentElement;
      const atBottom =
        window.innerHeight + window.scrollY >= doc.scrollHeight - 2;
      if (atBottom) return SECTIONS[SECTIONS.length - 1];

      const line = window.innerHeight * 0.4;
      let current = SECTIONS[0];
      for (const id of SECTIONS) {
        const node = document.getElementById(id);
        if (node && node.getBoundingClientRect().top <= line) current = id;
      }
      return current;
    };

    const onScroll = () => setActiveSection(getActiveSection());
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    onScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Lock background scroll while the remote viewer is open.
  useEffect(() => {
    document.body.style.overflow = openProject ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [openProject]);

  const handleNavigate = (id: string) => {
    const node = document.getElementById(id);
    if (node) node.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <>
      <div className="layout">
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
                  microfrontends, or interesting product work. The fastest way
                  to reach me is LinkedIn.
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
          <ProjectViewer
            projectId={openProject}
            onClose={() => setOpenProject(null)}
          />
        )}
      </div>

      <Analytics />
    </>
  );
}
