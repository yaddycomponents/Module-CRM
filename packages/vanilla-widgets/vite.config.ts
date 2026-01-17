import { defineConfig } from 'vite'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  server: {
    port: 5002,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5002,
    strictPort: true,
    cors: true,
  },
  plugins: [
    federation({
      name: 'vanillaWidgets',
      filename: 'remoteEntry.js',
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
