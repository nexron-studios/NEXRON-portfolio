export default {
  global: {
    loading: 'Loading',
    back: 'Back',
    open_repository: 'Open repository',
    open_live: 'Live demo',
    private_repository: 'Private repository',
    skip_to_content: 'Skip to content',
    close: 'Close'
  },
  nav: {
    index: 'Index',
    about: 'About',
    projects: 'Projects',
    journey: 'Journey',
    stack: 'Tech stack',
    contact: 'Contact',
    language: 'Language',
    theme: 'Appearance',
    theme_dark: 'Dark',
    theme_light: 'Light',
    menu_open: 'Open menu',
    menu_close: 'Close menu'
  },
  hero: {
    explore_projects: 'Explore projects',
    about_me: 'About me',
    location: 'Location',
    scroll_hint: 'Scroll',
    links_label: 'Links',
    kicker: 'Founder portfolio',
    scene_alt: 'Rotating cube in polished violet — the NEXRON object'
  },
  about: {
    title: 'About',
    heading: "Hey, I'm Jonas —",
    lead: 'I enjoy building software, training models and working on design.',
    terminal_hint: 'typing allowed',
    terminal_label: 'Terminal input',
    /** `{study}` is filled by a slot — the degree renders as a link. */
    body_1:
      "I study {study} at Offenburg University and I'm writing my bachelor's thesis right now.",
    study_link: 'Applied Artificial Intelligence',
    body_2:
      'I have worked with the Adobe stack for several years, and Blender brought 3D along with it — deepened during an internship and designing for clubs.',
    body_3:
      'What draws me in is the seam: bringing AI, design and development together in one project instead of settling into a single corner.',
    studio_label: 'The trade',
    services_label: 'What I offer',
    mark_alt: 'Rotating NEXRON Studios sign in chrome'
  },
  /**
   * The terminal transcript stays untranslated — a prompt is a prompt in
   * either language — but the game it opens is ordinary UI and is not.
   */
  tetris: {
    title: 'Tetris',
    close: 'Close game',
    score: 'Score',
    best: 'Best',
    level: 'Level',
    lines: 'Lines',
    next: 'Next up',
    paused: 'Paused',
    game_over: 'Game over',
    final_score: '{score} points',
    restart: 'Play again',
    move_left: 'Move left',
    move_right: 'Move right',
    rotate: 'Rotate',
    soft_drop: 'Soft drop',
    hard_drop: 'Hard drop',
    pause: 'Pause',
    settings: 'Settings',
    sound_on: 'Sound on',
    sound_off: 'Sound off',
    volume: 'Volume'
  },
  projects: {
    title: 'Projects',
    filter_all: 'All',
    enlarge: 'Enlarge {screen}',
    gallery_label: 'Screens of {project}',
    previous_screen: 'Previous screen',
    next_screen: 'Next screen',
    filter_label: 'Filter by category',
    clients_label: 'Clients',
    view_detail: 'Open project',
    empty: 'No projects in this category.',
    status_shipped: 'shipped',
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
    ongoing: 'ongoing',
    kind_education: 'Education',
    kind_work: 'Work',
    kind_studio: 'Studio'
  },
  stack: {
    title: 'Tech stack',
    show_all: 'All technologies in the four areas',
    core: 'core',
    domain_dev: 'Development',
    domain_ai: 'AI & Data',
    domain_creative: '3D & Creative',
    domain_infra: 'Infrastructure'
  },
  contact: {
    title: 'Contact',
    heading: 'Have an idea?',
    heading_accent: "Let's build something.",
    intro:
      'For business enquiries, collaborations or a project you want built: write to me. And if you just want to know how something here works, that too.',
    mail: 'Mail',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    send: 'Send message',
    sending: 'Sending',
    success: 'Message sent — thanks, I will get back to you.',
    error: 'Sending failed. Please try again or reach out on LinkedIn.',
    not_configured: 'The form is not configured yet.',
    error_name_required: 'Please enter your name.',
    error_email_required: 'Please enter your email address.',
    error_email_invalid: 'This email address does not look right.',
    error_message_required: 'Please enter a message.',
    error_message_short: 'A few more words would help.'
  },
  socials: {
    heading: 'Also findable here.'
  },
  footer: {
    built_with: 'Built with Vue, TypeScript and Three.js',
    imprint: 'Imprint',
    privacy: 'Privacy'
  }
}
