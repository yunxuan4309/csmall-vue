import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

function spaBypass(req) {
  const accept = req.headers.accept || ''
  if (accept.includes('text/html')) return '/index.html'
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src')
    }
  },
  server: {
    proxy: {
      '/sso':      { target: 'http://localhost:10087', bypass: spaBypass },
      '/front':    { target: 'http://localhost:10087', bypass: spaBypass },
      '/oms':      { target: 'http://localhost:10087', bypass: spaBypass },
      '/search':   { target: 'http://localhost:10087', bypass: spaBypass },
      '/resource': { target: 'http://localhost:10087', bypass: spaBypass },
      '/seckill':  { target: 'http://localhost:10087', bypass: spaBypass },
      '/user':     { target: 'http://localhost:10087', bypass: spaBypass },
      '/ums':      { target: 'http://localhost:10087', bypass: spaBypass },
      '/ai':       { target: 'http://localhost:10010', bypass: spaBypass },  // 直连 mall-ai，避免 Gateway 缓冲 SSE 流
      '/pms':      { target: 'http://localhost:10087', bypass: spaBypass },
      '/admin':    { target: 'http://localhost:10087', bypass: spaBypass },
      '/ams':      { target: 'http://localhost:10087', bypass: spaBypass },
    }
  }
})
