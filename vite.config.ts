import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.yaml'],
  test: {
    globals: true,
    environment: 'jsdom',
    deps: {
      inline: ['yaml'],
    },
  },
})
