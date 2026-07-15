export default function About() {
  return (
    <section id="about" className="section" aria-label="About">
      <h2 className="section__heading section__heading--mobile">
        <span className="section__num">01.</span> About
      </h2>
      <div className="prose">
        <p>
          I&rsquo;m a software engineer based in <em>Barcelona</em>. I
          enjoy finding opportunities to solve clients&rsquo; needs by building
          new digital solutions — turning complex requirements into products that
          are reliable, fast, and genuinely pleasant to use.
        </p>
        <p>
          I&rsquo;m happiest working where systems meet — taking separately built
          pieces and getting them to fit together into one seamless product. This
          site is a demonstration of exactly that — a{' '}
          <em>Microfrontend</em> shell that loads each showcase project as
          a separate, independently deployed application at runtime, each exposed
          as a <em>Module</em> and sharing a single React
          runtime.
        </p>
        <p>A few tools and technologies I work with:</p>
        <ul className="skills">
          <li>JS & TypeScript</li>
          <li>React & Vue</li>
          <li>Vite & Webpack</li>
          <li>Python, Java, C#</li>
          <li>HTML &amp; SCSS</li>
          <li>AWS & Cloudfare W.</li>
          <li className="skills__wide">Agentic Development & Prompt Engineering</li>
        </ul>
      </div>
    </section>
  );
}
