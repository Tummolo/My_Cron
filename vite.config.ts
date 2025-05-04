// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',        // oppure './' se vuoi che sia sempre relativo
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      '/api': {
        target: 'https://www.ios2020.altervista.org',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: {
          'www.ios2020.altervista.org': 'localhost'
        }
      },
    },
  },
})
