import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import path from "path"

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(
        path.dirname(new URL(import.meta.url).pathname),
        "./app",
      ),
    },
  },
  root: ".",
  base: "/",
  server: {
    port: 5173,
    strictPort: true,
    hmr: {
      clientPort: 5173,
    },
  },
  build: {
    outDir: "dist/static",
    rollupOptions: {
      input: "app/App.tsx",
      output: {
        entryFileNames: "app.js",
        chunkFileNames: "[name].js",
        assetFileNames: "[name][extname]",
      },
    },
  },
})
