import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('potrace-wasm')) return 'potrace'
          if (id.includes('wawoff2')) return 'wawoff2'
          if (id.includes('jszip')) return 'jszip'
          if (id.includes('opentype')) return 'opentype'
        },
      },
    },
  },
  server: {
    proxy: {
      '/api/agent': {
        target: 'https://openrouter.ai',
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/agent/, '/api'),
        configure: (proxy) => {
          proxy.on('proxyReq', (proxyReq) => {
            const key = env.OPENROUTER_API_KEY
            if (key && !proxyReq.getHeader('authorization')) {
              proxyReq.setHeader('Authorization', `Bearer ${key}`)
            }
          })
        },
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'),
      buffer: 'buffer/',
    },
  },
  optimizeDeps: {
    exclude: ['potrace-wasm', 'wawoff2'],
  },
}
})