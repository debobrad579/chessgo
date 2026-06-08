import { defineConfig } from "astro/config"
import react from "@astrojs/react"
import tailwindcss from "@tailwindcss/vite"
import { loadEnv } from "vite"

const { PUBLIC_APP_URL } = loadEnv(
  process.env.NODE_ENV || "development",
  process.cwd(),
  "",
)

export default defineConfig({
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
    server: {
      fs: {
        allow: [".."],
      },
    },
  },
  redirects: {
    "/bot": `${PUBLIC_APP_URL}/bot`,
    "/games": `${PUBLIC_APP_URL}/games`,
  },
})
