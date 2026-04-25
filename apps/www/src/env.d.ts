/// <reference types="astro/client" />
declare module "*.css"

interface ImportMetaEnv {
  readonly PUBLIC_APP_URL: string
  readonly PUBLIC_API_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
