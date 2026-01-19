import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const remoteUrl = env.VITE_REMOTE_URL || 'http://localhost:5001/mf-manifest.json'
  const vanillaUrl = env.VITE_VANILLA_URL || 'http://localhost:5002/mf-manifest.json'
  const isProduction = mode === 'production'

  return {
    server: {
      port: 3000,
      strictPort: true,
      origin: 'http://localhost:3000',
    },
    preview: {
      port: 3000,
      strictPort: true,
    },
    base: isProduction ? '/' : 'http://localhost:3000',
    plugins: [
      react(),
      federation({
        name: 'crmHost',
        remotes: {
          cashappsRemote: {
            type: 'module',
            name: 'cashappsRemote',
            entry: remoteUrl,
          },
          vanillaWidgets: {
            type: 'module',
            name: 'vanillaWidgets',
            entry: vanillaUrl,
          },
        },
        shared: {
          react: {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-dom': {
            singleton: true,
            requiredVersion: '^18.2.0',
          },
          'react-router-dom': {
            singleton: true,
            requiredVersion: '^6.21.0',
          },
          antd: {
            singleton: true,
            requiredVersion: '^5.12.0',
          },
        },
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
