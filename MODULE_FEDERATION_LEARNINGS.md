# Module Federation with Vite - Production Learnings

This document captures all the learnings from setting up Module Federation with `@module-federation/vite` for a multi-app CRM platform deployed on Vercel.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                     crm-host (Port 3000)                        │
│                   Host Application (React)                       │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  Consumes:                                               │   │
│  │  - cashappsRemote/PaymentList                           │   │
│  │  - cashappsRemote/PaymentDetails                        │   │
│  │  - cashappsRemote/routes                                │   │
│  │  - vanillaWidgets/registerAll                           │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
         │                                    │
         ▼                                    ▼
┌─────────────────────┐          ┌─────────────────────┐
│ cashapps-remote     │          │ vanilla-widgets     │
│ (Port 5001)         │          │ (Port 5002)         │
│ React Remote        │          │ Vanilla JS Remote   │
│                     │          │                     │
│ Exposes:            │          │ Exposes:            │
│ - ./PaymentList     │          │ - ./StatsWidget     │
│ - ./PaymentDetails  │          │ - ./registerAll     │
│ - ./routes          │          │                     │
└─────────────────────┘          └─────────────────────┘
```

## Key Configuration Files

### Remote Application (cashapps-remote/vite.config.ts)

```typescript
import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { federation } from '@module-federation/vite'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const isProduction = mode === 'production'
  const devBaseUrl = 'http://localhost:5001'
  const prodBaseUrl = env.VITE_BASE_URL || 'https://your-remote.vercel.app'

  return {
    server: {
      port: 5001,
      strictPort: true,
      cors: true,
      origin: devBaseUrl,
    },
    base: isProduction ? `${prodBaseUrl}/` : `${devBaseUrl}/`,
    plugins: [
      react(),
      federation({
        name: 'cashappsRemote',
        filename: 'remoteEntry.js',
        manifest: true,
        // CRITICAL: getPublicPath ensures absolute URLs in manifest
        getPublicPath: isProduction
          ? `return "${prodBaseUrl}/"`
          : `return "${devBaseUrl}/"`,
        exposes: {
          './PaymentList': './src/components/PaymentList/index.tsx',
          './PaymentDetails': './src/components/PaymentDetails/index.tsx',
          './routes': './src/routes.ts',
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.2.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
          'react-router-dom': { singleton: true, requiredVersion: '^6.21.0' },
          antd: { singleton: true, requiredVersion: '^5.12.0' },
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
```

### Host Application (crm-host/vite.config.ts)

```typescript
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
    base: isProduction ? '/' : 'http://localhost:3000',
    plugins: [
      react(),
      federation({
        name: 'crmHost',
        filename: 'remoteEntry.js',  // Required even for hosts
        manifest: true,               // Required for MF runtime init
        remotes: {
          cashappsRemote: {
            type: 'module',
            name: 'cashappsRemote',
            entry: remoteUrl,  // Points to mf-manifest.json
          },
          vanillaWidgets: {
            type: 'module',
            name: 'vanillaWidgets',
            entry: vanillaUrl,
          },
        },
        shared: {
          react: { singleton: true, requiredVersion: '^18.2.0' },
          'react-dom': { singleton: true, requiredVersion: '^18.2.0' },
          'react-router-dom': { singleton: true, requiredVersion: '^6.21.0' },
          antd: { singleton: true, requiredVersion: '^5.12.0' },
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
```

### Vercel Configuration (vercel.json)

```json
{
  "buildCommand": "pnpm run build",
  "outputDirectory": "dist",
  "framework": null,
  "rewrites": [
    {
      "source": "/((?!assets/|mf-manifest.json|remoteEntry.js).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/mf-manifest.json",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    },
    {
      "source": "/remoteEntry.js",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=0, must-revalidate" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    },
    {
      "source": "/assets/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" },
        { "key": "Access-Control-Allow-Origin", "value": "*" }
      ]
    }
  ]
}
```

---

## Critical Learnings

### 1. The `getPublicPath` Problem (Most Important)

**Problem:** Remote assets were being requested from the HOST's domain instead of the REMOTE's domain.

```
Expected: https://cashapps-remote.vercel.app/assets/index-xxx.js
Actual:   https://crm-host.vercel.app/assets/index-xxx.js (404!)
```

**Root Cause:** The `mf-manifest.json` contained relative paths like `assets/index-xxx.js`. When the host loaded this manifest, it resolved paths relative to its own domain.

**Solution:** Use the `getPublicPath` option in the MF plugin to embed absolute URLs:

```typescript
federation({
  // ...
  getPublicPath: isProduction
    ? `return "https://your-remote.vercel.app/"`
    : `return "http://localhost:5001/"`,
})
```

This makes the manifest contain full URLs that the browser resolves correctly.

---

### 2. Host Needs `filename` and `manifest` Too

**Problem:** Error loading `/remoteEntry.js` from the host's domain.

```
TypeError: error loading dynamically imported module:
https://crm-host.vercel.app/remoteEntry.js
```

**Root Cause:** The MF runtime initializes itself even for host-only applications. Without `filename: 'remoteEntry.js'` and `manifest: true`, the runtime couldn't find its initialization files.

**Solution:** Always include these options, even for hosts that don't expose anything:

```typescript
federation({
  name: 'crmHost',
  filename: 'remoteEntry.js',  // Required!
  manifest: true,               // Required!
  remotes: { /* ... */ },
})
```

---

### 3. Vercel Rewrites Can Break MF Files

**Problem:** `mf-manifest.json` and `remoteEntry.js` returning HTML (the SPA index.html).

**Root Cause:** Vercel's SPA rewrite was catching these files:
```json
{ "source": "/(.*)", "destination": "/index.html" }
```

**Solution:** Exclude MF files from the rewrite pattern:

```json
{
  "source": "/((?!assets/|mf-manifest.json|remoteEntry.js).*)",
  "destination": "/index.html"
}
```

---

### 4. CORS Headers Are Essential

**Problem:** Cross-origin request blocked when host tries to load remote's manifest.

**Solution:** Add CORS headers for all MF-related files:

```json
{
  "source": "/mf-manifest.json",
  "headers": [
    { "key": "Access-Control-Allow-Origin", "value": "*" }
  ]
}
```

---

### 5. Cache-Control Strategy

| File | Cache Strategy | Reason |
|------|---------------|--------|
| `mf-manifest.json` | `max-age=0, must-revalidate` | Always fetch latest to get new versions |
| `remoteEntry.js` | `max-age=0, must-revalidate` | Entry point must be fresh |
| `assets/*` | `max-age=31536000, immutable` | Content-hashed, safe to cache forever |

---

### 6. Singleton Sharing for React

**Problem:** Multiple React instances causing hooks errors or context issues.

**Solution:** Configure shared dependencies as singletons with matching versions:

```typescript
shared: {
  react: {
    singleton: true,
    requiredVersion: '^18.2.0',
  },
  'react-dom': {
    singleton: true,
    requiredVersion: '^18.2.0',
  },
}
```

---

### 7. Environment Variables for Production URLs

Use environment variables to configure remote URLs:

```typescript
// vite.config.ts
const remoteUrl = env.VITE_REMOTE_URL || 'http://localhost:5001/mf-manifest.json'
```

Set in Vercel dashboard or `.env.production`:
```
VITE_REMOTE_URL=https://cashapps-remote.vercel.app/mf-manifest.json
VITE_VANILLA_URL=https://vanilla-widgets.vercel.app/mf-manifest.json
```

---

## Common Errors & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| `Module ./X does not exist in container` | Wrong container being queried | Check `getPublicPath` is set correctly |
| `Failed to get manifest RUNTIME-003` | CORS or 404 on manifest | Add CORS headers, check rewrite rules |
| `error loading dynamically imported module: /remoteEntry.js` | Host missing filename/manifest | Add `filename` and `manifest` to host config |
| `disallowed MIME type "text/plain"` | File returning HTML due to rewrite | Exclude MF files from SPA rewrite |
| `NS_ERROR_CORRUPTED_CONTENT` | Browser cache serving old hashes | Hard refresh (Cmd+Shift+R) |

---

## Deployment Checklist

- [ ] All remotes have `getPublicPath` with absolute production URLs
- [ ] All apps have `filename: 'remoteEntry.js'` and `manifest: true`
- [ ] `vercel.json` excludes `mf-manifest.json` and `remoteEntry.js` from rewrites
- [ ] CORS headers set for `/mf-manifest.json`, `/remoteEntry.js`, `/assets/*`
- [ ] Environment variables set for remote URLs (`VITE_REMOTE_URL`, etc.)
- [ ] Shared dependencies have matching `singleton` and `requiredVersion`
- [ ] Build target is `esnext` for ESM module support

---

## File Structure Reference

```
ModuleFed/
├── packages/
│   ├── crm-host/              # Host application
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   └── vercel.json
│   ├── cashapps-remote/       # React remote
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   └── vercel.json
│   ├── vanilla-widgets/       # Vanilla JS remote
│   │   ├── src/
│   │   ├── vite.config.ts
│   │   └── vercel.json
│   └── growcomponents/        # Shared component library (npm)
├── .github/
│   └── workflows/
│       └── deploy.yml         # CI/CD for all apps
├── turbo.json
├── pnpm-workspace.yaml
└── package.json
```

---

## Build Output Reference

After running `pnpm build` in a remote:

```
dist/
├── index.html
├── mf-manifest.json          # MF metadata with publicPath
├── remoteEntry.js            # MF entry point (at root!)
└── assets/
    ├── index-[hash].js       # App chunks
    ├── routes-[hash].js      # Exposed modules
    └── ...
```

The `remoteEntry.js` MUST be at the root, not in assets.

---

## Useful Commands

```bash
# Development (all apps)
pnpm dev

# Build all
pnpm build

# Build specific package
pnpm --filter cashapps-remote build

# Check manifest
curl https://your-remote.vercel.app/mf-manifest.json | jq '.metaData.publicPath'

# Test CORS
curl -I https://your-remote.vercel.app/mf-manifest.json | grep -i access-control
```

---

## Resources

- [@module-federation/vite](https://github.com/module-federation/vite)
- [Module Federation 2.0 Docs](https://module-federation.io/)
- [Vercel Headers Configuration](https://vercel.com/docs/projects/project-configuration#headers)
