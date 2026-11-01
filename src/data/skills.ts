import type { SkillGroupProps } from '@/types/skill.type'

/**
 * Technology groups.
 *
 * Rendered as plain lines under "Womit ich arbeite" in About; only the
 * `isCore` names are shown, the ones a shipped project actually carries.
 */
export const skillGroups: SkillGroupProps[] = [
  {
    id: 'frontend',
    label: 'Frontend',
    domain: 'dev',
    skills: [
      { name: 'Vue 3', isCore: true },
      { name: 'TypeScript', isCore: true },
      { name: 'JavaScript', isCore: true },
      { name: 'Tailwind CSS', isCore: true },
      { name: 'Pinia', isCore: true },
      { name: 'Vite', isCore: true },
      { name: 'Vitest', isCore: true },
      { name: 'HTML', isCore: true },
      { name: 'CSS', isCore: true }
    ]
  },
  {
    id: 'threed',
    label: '3D & Interactive',
    domain: 'creative',
    skills: [
      { name: 'Three.js', isCore: true },
      { name: 'Blender', isCore: true },
      { name: 'GLSL', isCore: false },
      { name: 'WebGL', isCore: true }
    ]
  },
  {
    id: 'desktop',
    label: 'Desktop & Systems',
    domain: 'infra',
    skills: [
      { name: 'Tauri', isCore: true },
      { name: 'Rust', isCore: true },
      { name: 'SQLite', isCore: true }
    ]
  },
  {
    id: 'backend',
    label: 'Backend & Infrastructure',
    domain: 'infra',
    skills: [
      { name: 'PostgreSQL', isCore: true },
      { name: 'Docker', isCore: true },
      { name: 'NestJS', isCore: true },
      { name: 'FastAPI', isCore: true },
      { name: 'Uvicorn', isCore: false },
      { name: 'Prisma', isCore: true },
      { name: 'Socket.io', isCore: true },
      { name: 'REST APIs', isCore: true }
    ]
  },
  {
    id: 'ai',
    label: 'AI & Machine Learning',
    domain: 'ai',
    skills: [
      { name: 'LLM agents', isCore: true },
      { name: 'Multi-agent systems', isCore: true },
      { name: 'Chatbots', isCore: true },
      { name: 'RAG', isCore: true },
      { name: 'PyTorch', isCore: true },
      { name: 'TensorFlow', isCore: false },
      { name: 'Keras', isCore: true },
      { name: 'scikit-learn', isCore: true },
      { name: 'Hugging Face', isCore: true },
      { name: 'spaCy', isCore: false },
      { name: 'OpenAI Gym', isCore: false },
      { name: 'OpenCV', isCore: false }
    ]
  },
  {
    id: 'data',
    label: 'Data Science',
    domain: 'ai',
    skills: [
      { name: 'Python', isCore: true },
      { name: 'NumPy', isCore: true },
      { name: 'Pandas', isCore: true },
      { name: 'Matplotlib', isCore: true },
      { name: 'Seaborn', isCore: false },
      { name: 'ARIMA', isCore: false },
      { name: 'MATLAB', isCore: false }
    ]
  },
  {
    id: 'creative',
    label: 'Creative Tools',
    domain: 'creative',
    skills: [
      { name: 'Photoshop', isCore: true },
      { name: 'Illustrator', isCore: true },
      { name: 'Premiere Pro', isCore: true },
      { name: 'After Effects', isCore: true },
      { name: 'InDesign', isCore: false }
    ]
  }
]
