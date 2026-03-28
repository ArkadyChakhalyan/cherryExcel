import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/vishnya/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'ВИШНЯ',
        short_name: 'ВИШНЯ',
        theme_color: '#7c3aed',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [{ src: 'cherry-192.png', sizes: '192x192', type: 'image/png' }],
      },
    }),
  ],
  test: { environment: 'node' },
})
