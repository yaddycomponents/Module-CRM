import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const baseUrl = env.VITE_BASE_URL || 'http://localhost:5001'

  return {
    server: {
      port: 5001,
      strictPort: true,
      cors: true,
      origin: 'http://localhost:5001',
    },
    preview: {
      port: 5001,
      strictPort: true,
      cors: true,
    },
    base: isProduction ? '/' : baseUrl,
    plugins: [
      react(),
      federation({
        name: 'cashappsRemote',
        filename: 'remoteEntry.js',
        manifest: true,
        exposes: {
          './PaymentList': './src/components/PaymentList/index.tsx',
          './PaymentDetails': './src/components/PaymentDetails/index.tsx',
          './routes': './src/routes.ts',
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
