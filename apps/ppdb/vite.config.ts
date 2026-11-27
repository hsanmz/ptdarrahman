import { defineConfig } from 'vite'
import path from 'path'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const apiProxy = {
  target: 'http://localhost:8000',
  changeOrigin: true,
  bypass: (req: any) => {
    if (req.headers?.accept?.includes('text/html')) {
      return '/index.html'
    }
  },
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5174,
    // Gagal cepat kalau port dipakai (jangan geser diam-diam: HMR + API_BASE
    // mengasumsikan port ini).
    strictPort: true,
    proxy: {
      '/auth': apiProxy,
      '/ppdb': apiProxy,
      '/payment': apiProxy,
      '/cbt': apiProxy,
      '/selection': apiProxy,
      '/companyprofile': apiProxy,
      '/notifications': apiProxy,
      '/users': apiProxy,
      '/roles': apiProxy,
      '/settings': apiProxy,
      '/uploads': apiProxy,
    },
  },
  preview: {
    proxy: {},
  },
})
