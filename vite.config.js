import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server:{
    proxy:{
      '/api':{target:'http://localhost:5000',changeOrigin:true,secure:false},
      '/user':{target:'http://localhost:5000',changeOrigin:true,secure:false},
      '/products':{target:'http://localhost:5000',changeOrigin:true,secure:false},
      '/cart':{target:'http://localhost:5000',changeOrigin:true,secure:false},
      '/orders':{target:'http://localhost:5000',changeOrigin:true,secure:false},
    },
  },
})
