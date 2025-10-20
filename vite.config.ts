import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Set the target to a modern environment that supports import.meta.env
    target: 'esnext'
  }
  
})
