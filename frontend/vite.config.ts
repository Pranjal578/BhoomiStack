import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      }
    }
  },
  build: {
    // Item 11: Image & asset compression
    assetsInlineLimit: 4096, // Inline assets < 4KB as base64
    rollupOptions: {
      output: {
        // Split vendor chunks for better caching and load speed (Item 12)
        manualChunks: (id: string) => {
          if (id.includes('node_modules/react') || id.includes('node_modules/react-dom') || id.includes('node_modules/react-router-dom')) {
            return 'vendor';
          }
          if (id.includes('node_modules/recharts')) return 'charts';
          if (id.includes('node_modules/maplibre-gl')) return 'map';
          if (id.includes('node_modules/lucide-react')) return 'icons';
          if (id.includes('node_modules/zustand') || id.includes('node_modules/axios')) return 'state';
        }
      }
    },
    // Generate source maps for debugging (disable in prod if size matters)
    sourcemap: false,
    // Target modern browsers for smaller bundles
    target: 'es2020',
    // Report chunk size warnings at 750KB
    chunkSizeWarningLimit: 750,
  }
})
