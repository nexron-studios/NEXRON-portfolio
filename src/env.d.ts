/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module '*.glsl' {
  const source: string
  export default source
}

interface ImportMetaEnv {
  /** Endpoint the contact form posts to (Web3Forms / Formspree). */
  readonly VITE_CONTACT_ENDPOINT: string | undefined
  /** Public access key for the contact provider — public by design, not a secret. */
  readonly VITE_CONTACT_ACCESS_KEY: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
