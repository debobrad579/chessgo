declare module "*.css"

interface ImportMetaEnv {
  readonly VITE_API_URL?: string
  readonly VITE_WWW_URL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
