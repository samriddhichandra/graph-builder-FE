import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom')) {
            return 'react'
          }
          if (id.includes('node_modules/@xyflow')) {
            return 'graph'
          }
          if (id.includes('node_modules/@tanstack') || id.includes('node_modules/zustand')) {
            return 'state'
          }
          return undefined
        },
      },
    },
  },
})
