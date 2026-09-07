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
 * `UnrealBloomPass` runs before tone mapping, so everything merely lit sits at a
 * luminance of at most 1, while the lamps are pushed deliberately above it with
 * their `emissiveIntensity`. A threshold of 1 separates the two without the
 * figure's skin glowing along.
 *
 * `OutputPass` takes over tone mapping and the sRGB conversion — `toneMapping`
 * stays set on the renderer and is applied there instead of in `render()`.
 *
 * The hero canvas is transparent so the page's backdrop shows through it, and
 * bloom over a transparent ground is where this classically falls apart. The
 * render pass therefore clears to alpha zero and the composer's targets keep
 * their alpha channel.
 */

/** Below this luminance nothing blooms. Lit surfaces cap at 1; the lamps exceed it. */
const THRESHOLD = 1
const STRENGTH = 0.55
const RADIUS = 0.5

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
