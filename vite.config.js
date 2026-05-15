import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/sso': 'http://localhost:10087',
      '/front': 'http://localhost:10087',
      '/oms': 'http://localhost:10087',
      '/search': 'http://localhost:10087',
      '/resource': 'http://localhost:10087',
      '/seckill': 'http://localhost:10087',
      '/admin': 'http://localhost:10087',
      '/user': 'http://localhost:10087',
      '/ai': 'http://localhost:10087',
    }
  }
})
