export default {
  global: {
    not_found: 'This page does not exist.',
    home: 'To the home page',
    loading: 'Loading',
    open_repository: 'Open repository',
    open_live: 'Live demo',
    private_repository: 'Private repository',
    skip_to_content: 'Skip to content',
    close: 'Close'
  },
  nav: {
    home: 'To the home page',
    label: 'Main navigation',
    about: 'About',
    projects: 'Projects',
    journey: 'Journey',
    contact: 'Contact',
    menu: 'Menu',
    close: 'Close'
  },
  /** The marquee band before Contact; ` / ` separates the items. */
  home: {
    band_build: "Let's build something / Get in touch"
  },
  hero: {
    /** `{name}`, `{studio}` and `{work}` are slots, set highlighted. */
    intro: "I'm {name}. Under {studio} I build {work}, and design them myself.",
    intro_work: 'desktop tools, web apps and AI applications',
    cta: 'See the projects',
    contact: 'Contact'
  },
  about: {
    title: 'About',
    heading_top: "Hey, I'm",
    heading_name: 'Jonas',
    /** The `{…}` parts are filled by slots and set in violet, as emphasis. */
    lead: 'I build {software}, train {models} and have been into {design} for a long time.',
    lead_software: 'software',
    lead_models: 'models',
    lead_design: 'design',
    /** `{study}` is the degree as a link; `{thesis}` is emphasis. */
    body_1:
      'I study {study} at Offenburg University and am writing my bachelor thesis on {thesis}.',
    study_link: 'Applied Artificial Intelligence',
    thesis_topic: 'AI and XR',
    body_3:
      'What draws me in is the seam: {seam} together in one project instead of settling into a single corner.',
    seam: 'bringing AI, design and development',
    services_label: 'What I offer',
    tools_label: 'Tools I work with',
    domain_dev: 'Development',
    domain_ai: 'AI & Data',
    domain_creative: '3D & Creative',
    domain_infra: 'Infrastructure',
    sign_alt: 'The NEXRON Studios sign in chrome, drag to turn'
  },
  projects: {
    all: 'All projects',
    next: 'Next project',
    download: 'Download',
    code_public: 'Public on GitHub',
    detail_year: 'Year',
    detail_kind: 'Kind',
    detail_status: 'Status',
    detail_code: 'Code',
    detail_story: 'How it came about',
    title: 'Projects',
    intro:
      'My own projects so far. Each one planned, designed and built by me, from the first screen to the release.',
    status_shipped: 'completed',
    status_building: 'building',
    status_experiment: 'experiment',
    detail_overview: 'Overview',
    detail_problem: 'Problem',
    detail_idea: 'Idea',
    detail_implementation: 'Implementation',
    detail_challenges: 'Challenges',
    detail_learnings: 'Learnings',
    detail_stack: 'Technologies',
    not_found: 'This project does not exist.',
    category_web: 'Web',
    category_desktop: 'Desktop',
    category_ai: 'AI',
    category_fullstack: 'Full-stack',
    category_3d: '3D',
    category_tools: 'Tools'
  },
  journey: {
    title: 'Journey',
    intro: 'From the workshop floor to AI and XR: the stations that got me here.',
    ongoing: 'today',
    kind_work: 'Work',
    kind_education: 'Education',
    kind_studio: 'Studio'
  },
  contact: {
    title: 'Contact',
    heading: "Have an idea? Let's build something.",
    intro: 'For requests, collaborations or a project you would like built: write to me.',
    write_mail: 'Or write an email',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send message',
    sending: 'Sending',
    success: 'Message sent. Thanks, I will get back to you.',
    error: 'Sending failed. Please try again or reach out on LinkedIn.',
    not_configured: 'The form is not configured yet.',
    error_name_required: 'Please enter your name.',
    error_email_required: 'Please enter your email address.',
    error_email_invalid: 'This email address does not look right.',
    error_message_required: 'Please enter a message.',
    error_message_short: 'A few more words would help.'
  },
  links: {
    title: 'Links',
    intro: 'I build web apps, desktop tools and AI applications under NEXRON Studios.',
    website: 'Website',
    write: 'Write me',
    latest: 'Latest projects',
    elsewhere: 'Find me here'
  },
  footer: {
    elsewhere: 'Also findable here.',
    built_with: 'Built with Vue, TypeScript and Three.js',
    back_to_top: 'Back to top'
  }
}
