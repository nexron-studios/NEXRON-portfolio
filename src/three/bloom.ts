import { Vector2, type Camera, type Scene, type WebGLRenderer } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'

/**
 * The halo around the podium lamps.
 *
 * **The threshold does the selecting, not layer masks.** Selective bloom over two
 * passes and a layer mask is the general answer and is not needed here:
 * `UnrealBloomPass` runs before tone mapping. The threshold selects bright
 * highlights, with the lamp emission tuned above it. Lit and reflective
 * surfaces can also exceed the threshold, so the bloom strength stays low.
 *
 * `OutputPass` takes over tone mapping and the sRGB conversion — `toneMapping`
 * stays set on the renderer and is applied there instead of in `render()`.
 *
 * The hero canvas is transparent so the page's backdrop shows through it, and
 * bloom over a transparent ground is where this classically falls apart. The
 * render pass therefore clears to alpha zero and the composer's targets keep
 * their alpha channel.
 */

/** Keep the broad podium surface out of bloom; only bright highlights qualify. */
const THRESHOLD = 1.3
/** A faint, tight halo now that desktop rendering actually enables bloom. */
const STRENGTH = 0.08
const RADIUS = 0.05

export interface BloomComposerProps {
  render: () => void
  setSize: (width: number, height: number, pixelRatio: number) => void
  dispose: () => void
}

export const createBloomComposer = (
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera
): BloomComposerProps => {
  const composer = new EffectComposer(renderer)

  const renderPass = new RenderPass(scene, camera)
  // Without this the pass clears opaque and the stage becomes a black rectangle
  // punched through the page background.
  renderPass.clearAlpha = 0

  const bloomPass = new UnrealBloomPass(new Vector2(1, 1), STRENGTH, RADIUS, THRESHOLD)

  composer.addPass(renderPass)
  composer.addPass(bloomPass)
  composer.addPass(new OutputPass())

  const setSize = (width: number, height: number, pixelRatio: number): void => {
    composer.setPixelRatio(pixelRatio)
    composer.setSize(width, height)
    bloomPass.setSize(width * pixelRatio, height * pixelRatio)
  }

  return {
    render: () => composer.render(),
    setSize,
    dispose: () => {
      bloomPass.dispose()
      composer.dispose()
    }
  }
}
