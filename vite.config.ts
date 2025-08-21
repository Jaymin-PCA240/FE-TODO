import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    proxy: {
      '/api': 'http://node-alb-567088048.ap-south-1.elb.amazonaws.com/'
    }
  }
})
