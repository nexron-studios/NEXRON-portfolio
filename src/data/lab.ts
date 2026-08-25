import type { LocalizedText } from '@/types/i18n.type'

export const labKindList = ['module', 'note'] as const
export type LabKind = (typeof labKindList)[number]

export interface LabEntryProps {
  id: string
  title: LocalizedText
  description: LocalizedText
  /**
   * `module` entries render a live interactive experiment in the Lab grid;
   * `note` entries are areas that have been worked on but have no runnable
   * demo attached — they stay text so nothing here pretends to be more
   * finished than it is.
   */
  kind: LabKind
  tags: string[]
}

/**
 * NEXRON Lab — the site arguing that it is itself a project.
 *
 * No counters, no statistics, nothing that could be mistaken for a metric.
 */
export const labEntries: LabEntryProps[] = [
  {
    id: 'voxel-forge',
    title: { de: 'Voxel Forge', en: 'Voxel Forge' },
    description: {
      de: 'Der Hero-Charakter wird prozedural aus einem InstancedMesh gebaut, solange kein GLB vorliegt. Derselbe Generator erzeugt hier zufällige Figuren.',
      en: 'The hero character is generated procedurally from an InstancedMesh while no GLB is present. The same generator produces random figures here.'
    },
    kind: 'module',
    tags: ['Three.js', 'InstancedMesh']
  },
  {
    id: 'grid-field',
    title: { de: 'Grid Field', en: 'Grid Field' },
    description: {
      de: 'Ein Partikelfeld, das auf den Cursor reagiert — Shader-Punkte statt Meshes, damit die Zahl der Partikel nicht zur Framerate wird.',
      en: 'A particle field reacting to the cursor — shader points instead of meshes, so the particle count does not become the frame rate.'
    },
    kind: 'module',
    tags: ['GLSL', 'Points']
  },
  {
    id: 'signal-noise',
    title: { de: 'Signal / Noise', en: 'Signal / Noise' },
    description: {
      de: 'Ein kleiner Fragment-Shader, der aus Rauschen ein Blueprint-Raster aufbaut und wieder zerfallen lässt.',
      en: 'A small fragment shader that assembles a blueprint grid out of noise and lets it decay again.'
    },
    kind: 'module',
    tags: ['GLSL', 'Noise']
  },
  {
    id: 'automation',
    title: { de: 'Automation & Workflows', en: 'Automation & Workflows' },
    description: {
      de: 'n8n-Workflows, Webhook-Integrationen und Scraping-Experimente — Werkzeuge, die im Hintergrund laufen statt eine Oberfläche zu haben.',
      en: 'n8n workflows, webhook integrations and scraping experiments — tools that run in the background instead of having a surface.'
    },
    kind: 'note',
    tags: ['n8n', 'Webhooks', 'Scraping']
  },
  {
    id: 'blender-pipeline',
    title: { de: 'Blender-Pipeline', en: 'Blender Pipeline' },
    description: {
      de: 'Render-Management und Workflow-Werkzeuge rund um Blender — der unspektakuläre Teil, ohne den 3D-Arbeit nicht skaliert.',
      en: 'Render management and workflow tooling around Blender — the unglamorous part without which 3D work does not scale.'
    },
    kind: 'note',
    tags: ['Blender', 'Python']
  }
]
