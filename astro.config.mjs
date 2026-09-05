import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"

export default defineConfig({
  site: "https://gakkii415.github.io",
  base: "/ai-recipe-poc",
  output: "static",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
})

