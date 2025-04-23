import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // server: {
  //   proxy: {
  //     // Khi frontend gọi /api/..., Vite sẽ proxy về localhost:5000
  //     '/api': {
  //       target: 'http://localhost:5173',
  //       changeOrigin: true,
  //       rewrite: path => path.replace(/^\/api/, '/api')
  //     }
  //   }
  // }
});
