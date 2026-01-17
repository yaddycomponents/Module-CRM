import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import federation from '@originjs/vite-plugin-federation'

export default defineConfig({
  server: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
  preview: {
    port: 5001,
    strictPort: true,
    cors: true,
  },
  plugins: [
    react(),
    federation({
      name: 'cashappsRemote',
      filename: 'remoteEntry.js',
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
})
