import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  const remoteUrl = env.VITE_REMOTE_URL || 'http://localhost:5001/assets/remoteEntry.js'

  return {
    server: {
      port: 5000,
      strictPort: true,
    },
    preview: {
      port: 5000,
      strictPort: true,
    },
    plugins: [
      react(),
      federation({
        name: 'crmHost',
        remotes: {
          cashappsRemote: remoteUrl,
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
