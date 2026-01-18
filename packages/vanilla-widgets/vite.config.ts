import { defineConfig, loadEnv } from 'vite'
import { federation } from '@module-federation/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const baseUrl = env.VITE_BASE_URL || 'http://localhost:5002'

  return {
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
    base: isProduction ? '/' : baseUrl,
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
  }
})
