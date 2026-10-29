import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/wedding/', // Add this if hosting on GitHub pages in a subfolder! If Netlify/Vercel, leave as '/'
})