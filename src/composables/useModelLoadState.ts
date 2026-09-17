import { shallowRef } from 'vue'

/**
 * Where a scene's model file is: still on the wire, in the scene, or lost.
 *
 * Every scene here mounts its canvas long before the GLB lands, and the stage
 * box is sized by layout, so the visitor is looking at a hole that fills in
 * without warning. The two flags let the component hold a placeholder in that
 * hole and fade the canvas in only once there is something on it.
 *
 * A failed load clears `isModelLoading` as well: a spinner that never stops
 * is worse than an empty stage — every scene is decoration over copy that
 * stands on its own.
 */
export const useModelLoadState = () => {
  const isModelLoading = shallowRef(true)
  const isModelReady = shallowRef(false)

  const markLoaded = (): void => {
    isModelLoading.value = false
    isModelReady.value = true
  }

  const markFailed = (): void => {
    isModelLoading.value = false
  }

  return { isModelLoading, isModelReady, markLoaded, markFailed }
}
