import reactRefresh from '@vitejs/plugin-react-refresh'
import { resolve } from 'path'
import { defineConfig } from 'vite'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  define: {
    'process.env': process.env,
  },
  resolve: {
    alias: {
      '~': resolve(__dirname, 'src'),
    },
  },
  server: {
    // port: 1000,
    proxy: {
      // '/': 'https://homebg.ga/',
      // '/api': 'https://homebg.ga/api',
      // '/api': 'http://localhost:8081',
      '/api': 'http://localhost:8080',
    },
  },
})
