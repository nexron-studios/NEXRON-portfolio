import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  // A Cloudflare quick tunnel serves the site from a random *.trycloudflare.com
  // host, which Vite's host check would otherwise reject as a DNS-rebinding
  // attempt. Only the wildcard is allowed, never `true`.
  server: {
    // 5174, not Vite's default 5173: nexron-tracki is a PWA that registers a
    // service worker on `localhost:5173` with scope `/`. That worker outlives
    // whichever project holds the port and keeps serving its own cached
    // index.html shell — old tab title, old favicon — over this app. A
    // separate port is a separate origin, so it can never claim this one.
    // strictPort keeps a busy 5174 from silently falling back into 5173.
    port: 5174,
    strictPort: true,
    allowedHosts: ['.trycloudflare.com']
  },
  preview: {
    allowedHosts: ['.trycloudflare.com']
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    target: 'es2022',
    // three is deliberately one large lazy chunk — warning at the default
    // 500 kB would fire on every build for a file that is never on the
    // critical path.
    chunkSizeWarningLimit: 700,
    rollupOptions: {
      output: {
        // three is ~600kB and only needed once a scene scrolls into view —
        // keeping it in its own chunk keeps the initial payload small.
        manualChunks(id: string) {
          if (id.includes('node_modules/three')) return 'three'
          return undefined
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    // jsdom defaults to about:blank, an opaque origin — a real one keeps
    // anything origin-sensitive behaving the way it does in a browser.
    environmentOptions: {
      jsdom: { url: 'http://localhost' }
    },
    include: ['src/**/__test__/**/*.spec.ts']
  }
})
