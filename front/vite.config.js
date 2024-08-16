import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
console.log('Current mode:', process.env.NODE_ENV);
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
})
