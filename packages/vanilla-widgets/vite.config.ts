import { defineConfig, loadEnv } from 'vite'
import { federation } from '@module-federation/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const devBaseUrl = 'http://localhost:5002'
  const prodBaseUrl = env.VITE_BASE_URL || 'https://vanilla-widgets-liart.vercel.app'

  return {
    server: {
      port: 5002,
      strictPort: true,
      cors: true,
      origin: devBaseUrl,
    },
    preview: {
      port: 5002,
      strictPort: true,
      cors: true,
    },
    base: isProduction ? `${prodBaseUrl}/` : `${devBaseUrl}/`,
    plugins: [
      federation({
        name: 'vanillaWidgets',
        filename: 'remoteEntry.js',
        manifest: true,
        getPublicPath: isProduction
          ? `return "${prodBaseUrl}/"`
          : `return "${devBaseUrl}/"`,
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
