import { defineConfig } from 'vite'

export default defineConfig({
  base: '/Kapytrips/',  // use your repo name
  build: {
    outDir: 'docs'       // build into docs/ so GitHub Pages can serve it
  }
})