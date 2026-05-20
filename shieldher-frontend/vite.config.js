import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],

  server: {
      open: false,
     proxy: {
      "/api": {
        target: "http://localhost:8000", // your Express port
        changeOrigin: true,
      },
  },
},
})