/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SITE_URL?: string
  readonly VITE_E2E_HOOKS?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}