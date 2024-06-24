import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fixReactVirtualized from 'esbuild-plugin-react-virtualized'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    esbuildOptions: {
      plugins: [fixReactVirtualized],
    },
  },
  css: {
    preprocessorOptions: {
      less: {
        // Here you can add Less global variables or modify Less configurations
        javascriptEnabled: true,
      },
    },
  },
})
