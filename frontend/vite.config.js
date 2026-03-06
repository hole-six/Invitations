import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.[jt]sx?$/,
    exclude: []
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.js': 'jsx',
        '.ts': 'tsx',
        '.jsx': 'jsx',
        '.tsx': 'tsx'
      }
    }
  },
  server: {
    port: 3000,
    open: true,
    proxy: {
      // Proxy /api/v1 endpoints to HiWeb API
      '/api/v1': {
        target: 'https://api.hiweb.vn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      // Proxy /api/public endpoints (for public invitation view)
      '/api/public': {
        target: 'https://api.hiweb.vn',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      // Proxy /invitations endpoints (legacy publish, etc.)
      '/invitations': {
        target: 'https://api.hiweb.vn/api',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      // Proxy /system endpoints to HiWeb API (with /api/v1 prefix)
      '/system': {
        target: 'https://api.hiweb.vn/api/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      },
      // Proxy /user endpoints to HiWeb API
      '/user': {
        target: 'https://api.hiweb.vn/api/v1',
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path
      }
    }
  }
})
