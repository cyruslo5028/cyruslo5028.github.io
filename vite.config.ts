import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Per requirement: GitHub Pages compatibility (custom domain scenario) + HashRouter.
  // If your site is NOT using a custom domain and is served under /<repo>/,
  // you may need to change this to '/<repo>/' (see README).
  base: '/',
  plugins: [react()],
})
