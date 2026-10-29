import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/wedding/', // 👈 Add this line! (Keep the trailing slash)
})