export default {
  global: {
    loading: 'Lädt',
    back: 'Zurück',
    open_repository: 'Repository öffnen',
    open_live: 'Live-Demo',
    private_repository: 'Privates Repository',
    skip_to_content: 'Zum Inhalt springen',
    close: 'Schließen'
  },
  nav: {
    index: 'Index',
    about: 'Über mich',
    projects: 'Projekte',
    journey: 'Werdegang',
    stack: 'Techstack',
    contact: 'Kontakt',
    language: 'Sprache',
    theme: 'Darstellung',
    theme_dark: 'Dunkel',
    theme_light: 'Hell',
    menu_open: 'Menü öffnen',
    menu_close: 'Menü schließen'
  },
  hero: {
    explore_projects: 'Projekte ansehen',
    about_me: 'Über mich',
    location: 'Standort',
    scroll_hint: 'Scrollen',
    links_label: 'Links',
    kicker: 'Founder Portfolio',
    scene_alt: 'Rotierender Würfel in poliertem Violett — das NEXRON-Objekt'
  },
  about: {
    title: 'Über mich',
    heading: 'Hey, ich bin Jonas —',
    lead: 'ich entwickle Software, trainiere Modelle und beschäftige mich mit Gestaltung.',
    terminal_hint: 'tippen erlaubt',
    terminal_label: 'Terminal-Eingabe',
    /** `{study}` is filled by a slot — the degree renders as a link. */
    body_1:
      'Ich studiere {study} an der Hochschule Offenburg und schreibe gerade meine Bachelorarbeit.',

    study_link: 'Angewandte Künstliche Intelligenz',

    body_2:
      'Mit dem Adobe-Stack arbeite ich schon seit mehreren Jahren. Über Blender bin ich dann auch immer mehr in 3D reingekommen — vertieft im Praktikum und durch Designs für Clubs.',

    body_3:
      'Am spannendsten finde ich Projekte, bei denen KI, Design und Entwicklung zusammenkommen. Genau diese Mischung macht für mich am meisten Spaß, statt mich nur auf einen Bereich festzulegen.',
    studio_label: 'Das Gewerbe',
    services_label: 'Was ich anbiete',
    mark_alt: 'Rotierendes NEXRON-Studios-Schild in Chrom'
  },
  /**
   * The terminal transcript stays untranslated — a prompt is a prompt in
   * either language — but the game it opens is ordinary UI and is not.
   */
  tetris: {
    title: 'Tetris',
    close: 'Spiel schließen',
    score: 'Punkte',
    best: 'Bestwert',
    level: 'Level',
    lines: 'Reihen',
    next: 'Als Nächstes',
    paused: 'Pausiert',
    game_over: 'Game over',
    final_score: '{score} Punkte',
    restart: 'Nochmal',
    move_left: 'Nach links',
    move_right: 'Nach rechts',
    rotate: 'Drehen',
    soft_drop: 'Sanft fallen',
    hard_drop: 'Sofort ablegen',
    pause: 'Pausieren',
    settings: 'Einstellungen',
    sound_on: 'Ton an',
    sound_off: 'Ton aus',
    volume: 'Lautstärke'
  },
  projects: {
    title: 'Projekte',
    filter_all: 'Alle',
    enlarge: '{screen} vergrößern',
    gallery_label: 'Screens von {project}',
    previous_screen: 'Vorheriger Screen',
    next_screen: 'Nächster Screen',
    filter_label: 'Nach Kategorie filtern',
    clients_label: 'Kunden',
    view_detail: 'Projekt öffnen',
    empty: 'Keine Projekte in dieser Kategorie.',
    status_shipped: 'ausgeliefert',
    status_building: 'in Arbeit',
    status_experiment: 'Experiment',
    detail_overview: 'Überblick',
    detail_problem: 'Problem',
    detail_idea: 'Idee',
    detail_implementation: 'Umsetzung',
    detail_challenges: 'Herausforderungen',
    detail_learnings: 'Gelernt',
    detail_stack: 'Technologien',
    not_found: 'Dieses Projekt gibt es nicht.',
    category_web: 'Web',
    category_desktop: 'Desktop',
    category_ai: 'KI',
    category_fullstack: 'Full-Stack',
    category_3d: '3D',
    category_tools: 'Tools'
  },
  journey: {
    title: 'Werdegang',
    ongoing: 'laufend',
    kind_education: 'Bildung',
    kind_work: 'Arbeit',
    kind_studio: 'Studio'
  },
  stack: {
    title: 'Techstack',
    show_all: 'Alle Technologien der vier Bereiche',
    core: 'Kern',
    domain_dev: 'Development',
    domain_ai: 'AI & Data',
    domain_creative: '3D & Creative',
    domain_infra: 'Infrastructure'
  },
  contact: {
    title: 'Kontakt',
    heading: 'Eine Idee?',
    heading_accent: 'Lass uns etwas bauen.',
    intro:
      'Für Geschäftsanfragen, Kooperationen oder ein Projekt, das du umgesetzt haben möchtest: schreib mir. Und wenn du einfach wissen willst, wie etwas hier gebaut ist, auch.',
    mail: 'Mail',
    name: 'Name',
    email: 'E-Mail',
    message: 'Nachricht',
    send: 'Nachricht senden',
    sending: 'Wird gesendet',
    success: 'Nachricht ist raus — danke, ich melde mich.',
    error: 'Senden fehlgeschlagen. Versuch es nochmal oder schreib mir auf LinkedIn.',
    not_configured: 'Das Formular ist noch nicht konfiguriert.',
    error_name_required: 'Bitte trag deinen Namen ein.',
    error_email_required: 'Bitte trag deine E-Mail-Adresse ein.',
    error_email_invalid: 'Diese E-Mail-Adresse sieht nicht richtig aus.',
    error_message_required: 'Bitte schreib eine Nachricht.',
    error_message_short: 'Ein paar Worte mehr wären hilfreich.'
  },
  socials: {
    heading: 'Sonst noch hier zu finden.'
  },
  footer: {
    built_with: 'Gebaut mit Vue, TypeScript und Three.js',
    imprint: 'Impressum',
    privacy: 'Datenschutz'
  }
}
