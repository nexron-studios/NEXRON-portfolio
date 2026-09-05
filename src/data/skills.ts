import type { OrbSkillProps, SkillGroupProps } from '@/types/skill.type'

/**
 * Technology groups.
 *
 * `domain` decides both the colour and which chamber of the tech-stack pit a
 * technology falls into. The 3D group sits on the creative side on purpose —
 * it is the hinge between the two halves of the profile, and colouring it
 * violet is what makes that split visible at a glance.
 */
export const skillGroups: SkillGroupProps[] = [
  {
    id: 'frontend',
    label: { de: 'Frontend', en: 'Frontend' },
    domain: 'dev',
    skills: [
      { name: 'Vue 3', quip: '<script setup> or nothing', isCore: true },
      { name: 'TypeScript', quip: 'any is not a type, it is a surrender', isCore: true },
      { name: 'JavaScript', quip: null, isCore: true },
      { name: 'Tailwind CSS', quip: null, isCore: true },
      { name: 'HTML', quip: null, isCore: true },
      { name: 'CSS', quip: 'still centering things in 2026', isCore: true }
    ]
  },
  {
    id: 'threed',
    label: { de: '3D & Interaktiv', en: '3D & Interactive' },
    domain: 'creative',
    skills: [
      { name: 'Three.js', quip: 'z-fighting is a lifestyle', isCore: true },
      { name: 'Blender', quip: null, isCore: true },
      { name: 'GLSL', quip: null, isCore: false },
      { name: 'WebGL', quip: null, isCore: true }
    ]
  },
  {
    id: 'desktop',
    label: { de: 'Desktop & Systems', en: 'Desktop & Systems' },
    domain: 'infra',
    skills: [
      { name: 'Tauri', quip: '6 MB, not 200', isCore: true },
      { name: 'Rust', quip: 'borrow checker: 1 — me: 0', isCore: true },
      { name: 'SQLite', quip: null, isCore: true }
    ]
  },
  {
    id: 'backend',
    label: { de: 'Backend & Infrastruktur', en: 'Backend & Infrastructure' },
    domain: 'infra',
    skills: [
      { name: 'PostgreSQL', quip: 'SELECT * FROM ideas;', isCore: true },
      { name: 'Docker', quip: 'works on my machine — and now on yours', isCore: true },
      { name: 'NestJS', quip: null, isCore: true },
      { name: 'FastAPI', quip: null, isCore: true },
      { name: 'Uvicorn', quip: null, isCore: false },
      { name: 'Prisma', quip: null, isCore: true },
      { name: 'Socket.io', quip: null, isCore: true },
      { name: 'REST APIs', quip: null, isCore: true }
    ]
  },
  {
    id: 'ai',
    label: { de: 'KI & Machine Learning', en: 'AI & Machine Learning' },
    domain: 'ai',
    skills: [
      { name: 'LLM-Agents', quip: 'it called the tool. twice.', isCore: true },
      { name: 'Multiagentensysteme', quip: null, isCore: true },
      { name: 'Chatbots', quip: null, isCore: true },
      { name: 'RAG', quip: null, isCore: true },
      { name: 'PyTorch', quip: 'loss go down', isCore: true },
      { name: 'TensorFlow', quip: null, isCore: false },
      { name: 'Keras', quip: null, isCore: true },
      { name: 'scikit-learn', quip: null, isCore: true },
      { name: 'Hugging Face', quip: null, isCore: true },
      { name: 'spaCy', quip: null, isCore: false },
      { name: 'OpenAI Gym', quip: null, isCore: false },
      { name: 'OpenCV', quip: "cv2.imshow('debug', frame)", isCore: false }
    ]
  },
  {
    id: 'data',
    label: { de: 'Data Science', en: 'Data Science' },
    domain: 'ai',
    skills: [
      { name: 'NumPy', quip: null, isCore: true },
      { name: 'Pandas', quip: 'df.head() and hope', isCore: true },
      { name: 'Matplotlib', quip: null, isCore: true },
      { name: 'Seaborn', quip: null, isCore: false },
      { name: 'ARIMA', quip: null, isCore: false },
      { name: 'MATLAB', quip: null, isCore: false }
    ]
  },
  {
    id: 'creative',
    label: { de: 'Creative Tools', en: 'Creative Tools' },
    domain: 'creative',
    skills: [
      { name: 'Photoshop', quip: null, isCore: true },
      { name: 'Illustrator', quip: null, isCore: true },
      { name: 'Premiere Pro', quip: null, isCore: true },
      { name: 'After Effects', quip: null, isCore: true },
      { name: 'InDesign', quip: null, isCore: false }
    ]
  }
]

/**
 * The subset that drops into the pit, grouped by chamber.
 *
 * Deliberately shorter than `skillGroups`: a chamber packed to the ceiling
 * reads as gravel rather than as a set of physical objects, and the balls
 * have to stay big enough to carry a legible label on hover.
 */
export const pitSkills: OrbSkillProps[] = [
  {
    name: 'Vue 3',
    domain: 'dev',
    weight: 1.4,
    blurb: { de: 'Mein Standard-Framework fürs Frontend.', en: 'My default frontend framework.' }
  },
  {
    name: 'TypeScript',
    domain: 'dev',
    weight: 1.3,
    blurb: {
      de: 'Typen statt Überraschungen zur Laufzeit.',
      en: 'Types instead of runtime surprises.'
    }
  },
  {
    name: 'Tailwind',
    domain: 'dev',
    weight: 1.0,
    blurb: {
      de: 'Styling im Markup, kein Klassen-Ratespiel.',
      en: 'Styling in the markup, no class guessing.'
    }
  },
  {
    name: 'Pinia',
    domain: 'dev',
    weight: 0.85,
    blurb: { de: 'Geteilter Zustand für Vue-Apps.', en: 'Shared state for Vue apps.' }
  },
  {
    name: 'Vite',
    domain: 'dev',
    weight: 0.85,
    blurb: { de: 'Build und Dev-Server, beides schnell.', en: 'Build and dev server, both fast.' }
  },
  {
    name: 'Vitest',
    domain: 'dev',
    weight: 0.8,
    blurb: { de: 'Tests für alles, was rechnet.', en: 'Tests for anything that computes.' }
  },
  {
    name: 'LLM-Agents',
    domain: 'ai',
    weight: 1.35,
    blurb: {
      de: 'Modelle, die Werkzeuge benutzen statt nur zu antworten.',
      en: 'Models that use tools instead of only answering.'
    }
  },
  {
    name: 'Multiagenten',
    domain: 'ai',
    weight: 1.2,
    blurb: {
      de: 'Mehrere Agents, die sich eine Aufgabe teilen.',
      en: 'Several agents splitting one task.'
    }
  },
  {
    name: 'Python',
    domain: 'ai',
    weight: 1.25,
    blurb: {
      de: 'Die Sprache für alles mit Daten und Modellen.',
      en: 'The language for anything with data and models.'
    }
  },
  {
    name: 'PyTorch',
    domain: 'ai',
    weight: 1.1,
    blurb: { de: 'Netze bauen und trainieren.', en: 'Building and training networks.' }
  },
  {
    name: 'Keras',
    domain: 'ai',
    weight: 0.9,
    blurb: {
      de: 'Netze aufsetzen, ohne den Unterbau neu zu bauen.',
      en: 'Setting up networks without rebuilding the plumbing.'
    }
  },
  {
    name: 'scikit-learn',
    domain: 'ai',
    weight: 1.0,
    blurb: {
      de: 'Klassische Modelle — oft das, was reicht.',
      en: 'Classical models — often all it takes.'
    }
  },
  {
    name: 'NumPy',
    domain: 'ai',
    weight: 1.05,
    blurb: {
      de: 'Die Arrays, auf denen alles andere aufsetzt.',
      en: 'The arrays everything else is built on.'
    }
  },
  {
    name: 'Pandas',
    domain: 'ai',
    weight: 0.9,
    blurb: {
      de: 'Daten sortieren, bevor das Modell sie sieht.',
      en: 'Sorting data before the model sees it.'
    }
  },
  {
    name: 'OpenCV',
    domain: 'ai',
    weight: 0.85,
    blurb: {
      de: 'Bilder und Video maschinell lesbar machen.',
      en: 'Making images and video machine-readable.'
    }
  },
  {
    name: 'Three.js',
    domain: 'creative',
    weight: 1.35,
    blurb: {
      de: '3D im Browser — auch dieser Würfel hier.',
      en: '3D in the browser — including this cube.'
    }
  },
  {
    name: 'Blender',
    domain: 'creative',
    weight: 1.2,
    blurb: { de: 'Modellieren, shaden, rendern.', en: 'Modelling, shading, rendering.' }
  },
  {
    name: 'GLSL',
    domain: 'creative',
    weight: 0.95,
    blurb: {
      de: 'Shader, wenn Material allein nicht reicht.',
      en: 'Shaders when a material is not enough.'
    }
  },
  {
    name: 'WebGL',
    domain: 'creative',
    weight: 0.95,
    blurb: { de: 'Die Schicht, auf der 3D im Web läuft.', en: 'The layer 3D on the web runs on.' }
  },
  {
    name: 'Photoshop',
    domain: 'creative',
    weight: 0.85,
    blurb: { de: 'Bildbearbeitung und Kampagnen-Grafik.', en: 'Image work and campaign graphics.' }
  },
  {
    name: 'Illustrator',
    domain: 'creative',
    weight: 0.8,
    blurb: { de: 'Logos und alles Vektorbasierte.', en: 'Logos and anything vector-based.' }
  },
  {
    name: 'After Effects',
    domain: 'creative',
    weight: 0.85,
    blurb: { de: 'Motion Design und Animation.', en: 'Motion design and animation.' }
  },
  {
    name: 'Premiere Pro',
    domain: 'creative',
    weight: 0.8,
    blurb: { de: 'Schnitt und Bewegtbild.', en: 'Editing and moving image.' }
  },
  {
    name: 'Docker',
    domain: 'infra',
    weight: 1.2,
    blurb: { de: 'Läuft hier, läuft auch dort.', en: 'Runs here, runs there too.' }
  },
  {
    name: 'PostgreSQL',
    domain: 'infra',
    weight: 1.25,
    blurb: { de: 'Die Datenbank, zu der ich zuerst greife.', en: 'The database I reach for first.' }
  },
  {
    name: 'Tauri',
    domain: 'infra',
    weight: 1.1,
    blurb: { de: 'Desktop-Apps in wenigen Megabyte.', en: 'Desktop apps in a few megabytes.' }
  },
  {
    name: 'Rust',
    domain: 'infra',
    weight: 1.05,
    blurb: {
      de: 'Der Kern, wenn es schnell und sicher sein muss.',
      en: 'The core when it has to be fast and safe.'
    }
  },
  {
    name: 'NestJS',
    domain: 'infra',
    weight: 0.9,
    blurb: { de: 'Strukturierte APIs auf Node.', en: 'Structured APIs on Node.' }
  },
  {
    name: 'FastAPI',
    domain: 'infra',
    weight: 0.85,
    blurb: {
      de: 'Schnelle Python-APIs, meist vor einem Modell.',
      en: 'Quick Python APIs, usually in front of a model.'
    }
  }
]
