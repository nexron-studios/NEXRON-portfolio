import { Vector2, type Camera, type Scene, type WebGLRenderer } from 'three'
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js'
import { OutputPass } from 'three/examples/jsm/postprocessing/OutputPass.js'
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js'
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass.js'

/**
 * A live 3D scene set as halftone, the GL sibling of `DitherArt`: the frame is
 * rendered as usual, then every cell of a screen-fixed grid becomes one round
 * dot whose area follows the light there. The grid does not move with the
 * model, so the dots swim over the form as it turns.
 *
 * The dot takes the hue of what it covers at full strength (grey chrome gives
 * white dots, a coloured rim light gives coloured ones), and the ground stays
 * transparent, so the page shows through between the dots.
 *
 * It runs after `OutputPass`, on display-ready colours, so the dot size
 * follows the brightness a reader sees rather than linear light.
 */

/** Side of one grid cell in CSS px. */
const CELL_PX = 6
/** Below 1 on purpose: the chrome is bright, and more would fill every cell. */
const GAIN = 0.95

const halftoneShader = {
  uniforms: {
    tDiffuse: { value: null },
    resolution: { value: new Vector2(1, 1) },
    cell: { value: CELL_PX },
    gain: { value: GAIN }
  },
  vertexShader: /* glsl */ `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: /* glsl */ `
    uniform sampler2D tDiffuse;
    uniform vec2 resolution;
    uniform float cell;
    uniform float gain;
    varying vec2 vUv;

    const float PI = 3.14159265;

    void main() {
      vec2 pixel = vUv * resolution;
      vec2 center = (floor(pixel / cell) + 0.5) * cell;
      vec4 source = texture2D(tDiffuse, center / resolution);

      float luminance = dot(source.rgb, vec3(0.2126, 0.7152, 0.0722));
      float level = clamp(luminance * gain, 0.0, 1.0);
      // Area, not radius, follows the level, as in DitherArt's halftoneRadius.
      float radius = cell * sqrt(level / PI);
      float coverage = 1.0 - smoothstep(radius - 0.75, radius + 0.75, distance(pixel, center));

      float peak = max(max(source.r, source.g), max(source.b, 1e-3));
      vec3 hue = clamp(source.rgb / peak, 0.0, 1.0);
      // The canvas is premultiplied: colour times coverage, coverage as alpha.
      gl_FragColor = vec4(hue * coverage, coverage);
    }
  `
}

export interface HalftoneComposer {
  render: () => void
  /** Width and height in CSS px, after the renderer has its new size and ratio. */
  setSize: (width: number, height: number) => void
  dispose: () => void
}

export const createHalftoneComposer = (
  renderer: WebGLRenderer,
  scene: Scene,
  camera: Camera
): HalftoneComposer => {
  const composer = new EffectComposer(renderer)
  const halftone = new ShaderPass(halftoneShader)
  composer.addPass(new RenderPass(scene, camera))
  composer.addPass(new OutputPass())
  composer.addPass(halftone)

  const setSize = (width: number, height: number): void => {
    const ratio = renderer.getPixelRatio()
    composer.setPixelRatio(ratio)
    composer.setSize(width, height)
    halftone.uniforms.resolution!.value.set(width * ratio, height * ratio)
    halftone.uniforms.cell!.value = CELL_PX * ratio
  }

  const size = renderer.getSize(new Vector2())
  setSize(size.x, size.y)

  return {
    render: () => composer.render(),
    setSize,
    dispose: () => {
      halftone.dispose()
      composer.dispose()
    }
  }
}
