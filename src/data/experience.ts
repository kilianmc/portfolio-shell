// Experience entries, most recent first. Each entry is a company block with a
// `roles` list (one or more positions held there). A role may carry a short
// one-line `desc` and/or a `bullets` list.

// A single position held at a company. Either `desc`, `bullets`, or both may
// be present (see the data.test.ts invariant).
export interface Role {
  title: string;
  range: string;
  desc?: string;
  bullets?: string[];
}

// A company block: one employer with one or more roles and a tech list.
export interface Experience {
  company: string;
  range: string;
  location: string;
  // Optional link to the company (rendered as an external link when present).
  url?: string;
  roles: Role[];
  tech: string[];
}

export const experience: Experience[] = [
  {
    company: 'Cognizant Netcentric',
    range: '2018 — Present',
    location: 'Barcelona, Spain',
    roles: [
      {
        title: 'AI Orchestrator (Full-Stack) · Senior Associate',
        range: 'Jun 2026 — Present',
        desc: 'Orchestrating AI-assisted workflows and tooling across the full stack.',
      },
      {
        title: 'Front-End Software Engineer · Senior Associate',
        range: 'Apr 2022 — Present',
        desc: 'Leading front-end delivery and mentoring on enterprise client projects.',
      },
      {
        title: 'Front-End Software Engineer · Associate',
        range: 'Sep 2020 — May 2022',
        desc: 'Building responsive, component-based interfaces for enterprise platforms.',
      },
      {
        title: 'Front-End Software Engineer · Programmer Analyst',
        range: 'Apr 2019 — Sep 2020',
        desc: 'Developing and maintaining front-end features to client specifications.',
      },
      {
        title: 'Front-End Software Engineer · Programmer',
        range: 'Nov 2018 — Apr 2019',
        desc: 'Implementing front-end components and integrations.',
      },
    ],
    tech: ['JavaScript', 'HTML & CSS', 'React'],
  },
  {
    company: 'Isi Condal',
    range: '2012 — 2018',
    location: 'Barcelona, Spain',
    roles: [
      {
        title: 'Web Area Manager',
        range: 'Jul 2015 — Oct 2018',
        bullets: [
          'Managed the company’s web department.',
          'Analysed client needs to install and adapt our B2B e-commerce platform, “i2i”.',
          'Built websites, web services and mobile apps (Android & iOS) to communicate with our products, and programmed new product modules.',
          'Created and delivered training courses for customers.',
          'Managed domains, hosts, servers and databases (Plesk, Heroku, Amazon AWS).',
        ],
      },
      {
        title: 'Software Developer',
        range: 'Jul 2012 — Jul 2015',
        bullets: [
          'Analysed and developed modules for our ERP, Isiparts (OpenEdge / Progress), to meet specific customer needs.',
          'Managed business support throughout the delivery process.',
        ],
      },
    ],
    tech: ['Android', 'iOS', 'Heroku', 'AWS', 'OpenEdge Progress'],
  },
  {
    company: '[I] Sistem',
    range: '2007 — 2008',
    location: 'Barcelona, Spain',
    roles: [
      {
        title: 'Web Developer',
        range: 'Jun 2007 — Jul 2008',
        bullets: [
          'Web development with Java, PHP, MySQL, XHTML, CSS, JavaScript, Laszlo, Flash and .NET.',
          'Built desktop applications in Visual Basic and Java.',
        ],
      },
    ],
    tech: ['Java', 'PHP', 'MySQL', 'JavaScript', '.NET'],
  },
];
