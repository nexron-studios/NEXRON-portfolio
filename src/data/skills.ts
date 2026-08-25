import type { OrbSkillProps, SkillGroupProps } from '@/types/skill.type'

/**
 * Technology groups.
 *
 * `domain` decides the colour: dev renders cyan, creative renders violet.
 * The 3D group sits on the creative side on purpose — it is the hinge
 * between the two halves of the profile, and colouring it violet is what
 * makes that split visible at a glance.
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
    domain: 'dev',
    skills: [
      { name: 'Tauri', quip: '6 MB, not 200', isCore: true },
      { name: 'Rust', quip: 'borrow checker: 1 — me: 0', isCore: true },
      { name: 'SQLite', quip: null, isCore: true }
    ]
  },
  {
    id: 'backend',
    label: { de: 'Backend & Infrastruktur', en: 'Backend & Infrastructure' },
    domain: 'dev',
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
    domain: 'dev',
    skills: [
      { name: 'PyTorch', quip: 'loss go down', isCore: true },
      { name: 'TensorFlow', quip: null, isCore: false },
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
    domain: 'dev',
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
      { name: 'InDesign', quip: null, isCore: false }
    ]
  }
]

/**
 * The subset that floats in the orb scene. Deliberately short — a crowded
 * orb field reads as noise rather than as a set of physical objects.
 */
export const orbSkills: OrbSkillProps[] = [
  { name: 'Vue', domain: 'dev', weight: 1.4 },
  { name: 'TypeScript', domain: 'dev', weight: 1.25 },
  { name: 'Three.js', domain: 'creative', weight: 1.3 },
  { name: 'Rust', domain: 'dev', weight: 1.0 },
  { name: 'Tauri', domain: 'dev', weight: 1.1 },
  { name: 'Python', domain: 'dev', weight: 1.15 },
  { name: 'PyTorch', domain: 'dev', weight: 0.95 },
  { name: 'PostgreSQL', domain: 'dev', weight: 1.0 },
  { name: 'Docker', domain: 'dev', weight: 0.9 },
  { name: 'Blender', domain: 'creative', weight: 1.2 },
  { name: 'Tailwind', domain: 'dev', weight: 0.85 },
  { name: 'NestJS', domain: 'dev', weight: 0.8 }
]
