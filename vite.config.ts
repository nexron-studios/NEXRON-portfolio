import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [vue(), tailwindcss()],
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
    include: ['src/**/__test__/**/*.spec.ts']
  }
})
