import { defineConfig } from 'vite'
import { federation } from '@module-federation/vite'

export default defineConfig({
  server: {
    port: 5002,
    strictPort: true,
    cors: true,
    origin: 'http://localhost:5002',
  },
  preview: {
    port: 5002,
    strictPort: true,
    cors: true,
  },
  base: 'http://localhost:5002',
  plugins: [
    federation({
      name: 'vanillaWidgets',
      filename: 'remoteEntry.js',
      manifest: true,
      exposes: {
        './StatsWidget': './src/StatsWidget.js',
        './registerAll': './src/index.js',
      },
      shared: {},
    }),
  ],
  build: {
    modulePreload: false,
    target: 'esnext',
    minify: false,
    cssCodeSplit: false,
  },
})
