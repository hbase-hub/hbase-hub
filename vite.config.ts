import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/hbase-hub/',
  server: {
    port: 54400,
  },
})
