import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'
// https://vitejs.dev/config/
export default defineConfig({
  plugins: [reactRefresh()],
  define: {
    'process.env': process.env,
  },
  server: {
    proxy: {
      // '/': 'https://homebg.ga/',
      // '/api': 'https://homebg.ga/api',
      '/api': 'http://localhost:8080',
    },
  },
})
