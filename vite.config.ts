// vite.config.ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/',        // in produzione il build sarà servito da Altervista con percorsi assoluti
  plugins: [react()],
  server: {
    host: 'localhost',
    port: 5173,
    proxy: {
      // Dev proxy per le tue API PHP su Altervista
      '/api': {
        target: 'https://ios2020.altervista.org',
        changeOrigin: true,
        secure: true,
        cookieDomainRewrite: {
          'ios2020.altervista.org': 'localhost'
        }
      },
      // Dev proxy per Socket.io in locale
      '/socket.io': {
        target: 'http://localhost:3000',  // dove gira il tuo chat-server in locale
        ws: true,
        changeOrigin: true
      }
    },
  },
})
