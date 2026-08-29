import { onBeforeUnmount, onMounted, shallowRef, watch, type Ref } from 'vue'
import {
  useDocumentVisibility,
  useIntersectionObserver,
  useRafFn,
  useResizeObserver
} from '@vueuse/core'
import {
  Clock,
  PerspectiveCamera,
  Scene,
  SRGBColorSpace,
  WebGLRenderer,
  type Material,
  type Object3D
} from 'three'
import { useUiStore } from '@/stores/ui'

export interface SceneContext {
  scene: Scene
  camera: PerspectiveCamera
  renderer: WebGLRenderer
  width: number
  height: number
  /** True on small viewports — scenes use it to cut object counts. */
  isCompact: boolean
}

export interface SceneHandle {
  /** Called once per frame. `elapsed` and `delta` are in seconds. */
  update?: (elapsed: number, delta: number) => void
  resize?: (width: number, height: number) => void
  /** Release anything the setup function allocated outside the scene graph. */
  dispose?: () => void
}

interface UseThreeSceneOptions {
  container: Ref<HTMLElement | null>
  canvas: Ref<HTMLCanvasElement | null>
  setup: (context: SceneContext) => SceneHandle
  /** Vertical field of view in degrees. */
  fov?: number
  /** Cap on device pixel ratio. Mobile gets a tighter cap automatically. */
  maxPixelRatio?: number
}

/** Below this width a scene is on a phone and cuts its object counts. */
export const COMPACT_BREAKPOINT = 768

/** How far outside the viewport a scene starts running, so it is never blank on arrival. */
const VISIBILITY_MARGIN = '120px'

/**
 * Frees every GPU resource reachable from an object graph.
 *
 * Three disposes nothing on its own — dropping the JS reference leaves the
 * buffers alive on the GPU, which is exactly how a site with several scenes
 * ends up losing its WebGL context after a few navigations.
 */
const disposeObject = (root: Object3D): void => {
  root.traverse((object) => {
    const mesh = object as Object3D & {
      geometry?: { dispose: () => void }
      material?: Material | Material[]
    }

    mesh.geometry?.dispose()

    const materials = Array.isArray(mesh.material)
      ? mesh.material
      : mesh.material
        ? [mesh.material]
        : []

    materials.forEach((material) => {
      Object.values(material).forEach((value) => {
        if (value && typeof value === 'object' && 'isTexture' in value) {
          ;(value as { dispose: () => void }).dispose()
        }
      })
      material.dispose()
    })
  })
}

/**
 * Owns the full lifecycle of a Three.js scene: renderer creation, the render
 * loop, resizing, pausing and teardown.
 *
 * The loop only runs while the container is actually on screen and the tab is
 * visible. With reduced motion requested it renders exactly one frame and
 * never starts a loop at all — the scene is still there, it just holds still.
 */
export const useThreeScene = (options: UseThreeSceneOptions) => {
  const { container, canvas, setup, fov = 42, maxPixelRatio = 2 } = options

  const uiStore = useUiStore()
  const isReady = shallowRef(false)
  /** True when this browser could not give us a WebGL context at all. */
  const isUnavailable = shallowRef(false)
  const documentVisibility = useDocumentVisibility()

  let renderer: WebGLRenderer | null = null
  let scene: Scene | null = null
  let camera: PerspectiveCamera | null = null
  let handle: SceneHandle | null = null
  let clock: Clock | null = null

  let isVisible = false

  const renderFrame = (): void => {
    if (!renderer || !scene || !camera || !clock) return

    const delta = clock.getDelta()
    handle?.update?.(clock.elapsedTime, delta)
    renderer.render(scene, camera)
  }

  const { pause, resume, isActive } = useRafFn(renderFrame, { immediate: false })

  const start = (): void => {
    // The observers below attach as soon as the container ref fills, which can
    // be before `onMounted` has built the renderer. Starting the loop then
    // would leave the clock stopped and freeze the scene at delta 0.
    if (!renderer || !clock) return
    if (isActive.value || uiStore.prefersReducedMotion) return

    clock.start()
    resume()
  }

  const stop = (): void => {
    if (!isActive.value) return
    pause()
    clock?.stop()
  }

  const syncRunState = (): void => {
    const shouldRun = isVisible && documentVisibility.value === 'visible'
    if (shouldRun) start()
    else stop()
  }

  const applySize = (width: number, height: number): void => {
    if (!renderer || !camera || width === 0 || height === 0) return

    const isCompact = width < COMPACT_BREAKPOINT
    const cap = isCompact ? Math.min(maxPixelRatio, 1.5) : maxPixelRatio

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, cap))
    renderer.setSize(width, height, false)

    camera.aspect = width / height
    camera.updateProjectionMatrix()

    handle?.resize?.(width, height)
  }

  useResizeObserver(container, (entries) => {
    const entry = entries[0]
    if (!entry) return
    applySize(entry.contentRect.width, entry.contentRect.height)
  })

  useIntersectionObserver(
    container,
    (entries) => {
      const entry = entries[0]
      if (!entry) return
      isVisible = entry.isIntersecting
      syncRunState()
    },
    { rootMargin: VISIBILITY_MARGIN }
  )

  watch(documentVisibility, syncRunState)

  onMounted(() => {
    const canvasElement = canvas.value
    const containerElement = container.value
    if (!canvasElement || !containerElement) return

    const { clientWidth, clientHeight } = containerElement
    const width = clientWidth || 1
    const height = clientHeight || 1

    // Not every visitor has WebGL: it can be switched off, blocked by an
    // extension, or unavailable on a blacklisted driver. The constructor
    // throws in that case, and an unhandled error in `mounted` takes the
    // section down with it. The scene simply does not appear instead —
    // every one of them is decoration over content that stands on its own.
    try {
      renderer = new WebGLRenderer({
        canvas: canvasElement,
        antialias: true,
        alpha: true,
        powerPreference: 'high-performance'
      })
    } catch {
      isUnavailable.value = true
      return
    }

    renderer.outputColorSpace = SRGBColorSpace
    renderer.setClearColor(0x000000, 0)

    scene = new Scene()
    camera = new PerspectiveCamera(fov, width / height, 0.1, 100)
    clock = new Clock(false)

    handle = setup({
      scene,
      camera,
      renderer,
      width,
      height,
      isCompact: width < COMPACT_BREAKPOINT
    })

    applySize(width, height)

    // One frame so the scene is present even when it never animates.
    clock.start()
    renderFrame()
    clock.stop()

    isReady.value = true

    // The intersection observer may already have reported the container as
    // visible while the renderer was still null; this picks that up.
    syncRunState()
  })

  // The observers and the rAF loop are torn down by VueUse; what is left here
  // is the GPU side, which nothing else knows how to release.
  onBeforeUnmount(() => {
    stop()

    handle?.dispose?.()
    if (scene) {
      disposeObject(scene)
      scene.clear()
    }

    renderer?.dispose()
    renderer?.forceContextLoss()

    renderer = null
    scene = null
    camera = null
    handle = null
    clock = null
  })

  return { isReady, isUnavailable }
}
