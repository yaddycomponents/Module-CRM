# Module-CRM

A Module Federation demo showcasing micro-frontend architecture with React, Antd, and pnpm workspaces.

## Architecture

```
┌─────────────────────────────────────────┐
│         CRM Host (:3000)                │
│  ┌─────────────────────────────────────┐│
│  │  Dashboard, Customers, Settings     ││
│  │  CashApps (Remote) ←────────────────┼┤
│  └─────────────────────────────────────┘│
└─────────────────────────────────────────┘
              ↑ HTTP (runtime)
┌─────────────────────────────────────────┐
│      CashApps Remote (:5001)            │
│  remoteEntry.js → PaymentList, routes   │
└─────────────────────────────────────────┘
              ↑ workspace:*
┌─────────────────────────────────────────┐
│       growcomponents-module             │
│  theme, CrmButton, StatCard, CrmTable   │
└─────────────────────────────────────────┘
```

## Packages

- **crm-host**: Main CRM application (host) - Port 3000
- **cashapps-remote**: Cash Application module (remote) - Port 5001
- **vanilla-widgets**: Framework-agnostic Web Components (remote) - Port 5002
- **growcomponents-module**: Shared component library

## Getting Started

```bash
# Install dependencies
pnpm install

# Build and run all packages (with Turborepo caching)
pnpm dev

# Run specific package
pnpm dev:host     # CRM Host only
pnpm dev:remote   # CashApps Remote only
pnpm dev:vanilla  # Vanilla Widgets only

# Build all packages
pnpm build

# Access
# Host: http://localhost:3000
# Remote: http://localhost:5001
# Vanilla: http://localhost:5002
```

## Turborepo

This project uses **Turborepo** for build orchestration:

```bash
# All commands use turbo under the hood
pnpm build          # Builds all packages (cached)
pnpm dev            # Runs dev servers for all packages
pnpm build --force  # Force rebuild (skip cache)
```

### How Turborepo Helps

| Without Turborepo | With Turborepo |
|-------------------|----------------|
| Rebuilds everything every time | Skips unchanged packages |
| Sequential builds | Parallel builds where possible |
| ~30s full build | ~2s cached build |
| Manual dependency ordering | Automatic task pipelines |

### Task Pipeline (turbo.json)

```
build → depends on ^build (dependencies first)
       ↓
dev   → depends on ^build (remotes must build first)
       ↓
preview → depends on build
```

### Local Cache

Turborepo caches build outputs in `.turbo/`. Inputs that invalidate cache:
- `src/**` - Source files
- `vite.config.ts` - Build config
- `tsconfig.json` - TypeScript config
- `federation.config.json` - Module Federation config

### Remote Cache (Vercel)

Share build cache across CI and team members:

**1. Local Setup (one-time)**
```bash
# Login to Vercel
npx turbo login

# Link project to Vercel
npx turbo link
```

**2. CI Setup (GitHub Actions)**

Add these to your repository:

| Type | Name | Value |
|------|------|-------|
| Secret | `VERCEL_TOKEN` | Your Vercel token |
| Variable | `TURBO_TEAM` | Your Vercel team slug (or username) |

The workflow automatically uses `VERCEL_TOKEN` as `TURBO_TOKEN`.

**Benefits:**
```
First CI run:     5 min (builds everything, uploads to cache)
Second CI run:    30 sec (downloads from cache)
Local after CI:   instant (reuses CI cache)
```

**How it works:**
```
Developer A builds → uploads to Vercel Cache
                              ↓
CI runs        → downloads from cache (skip build)
                              ↓
Developer B   → downloads from cache (instant)
```

## Key Features

- Runtime Module Federation with Vite
- Shared theme and components
- IKEA pattern for route sharing
- DevTools panel for debugging federation
- Independent deployment (remote updates without host redeploy)

## Deployment

### Vercel (Recommended for quick setup)

Pre-configured with `.github/workflows/deploy.yml`:
- Automatic deployment on push to main
- Path-based filtering (only deploys changed packages)
- Manual trigger with environment selection

### AWS

See [AWS Deployment Guide](./docs/AWS_DEPLOYMENT.md) for detailed instructions:

**Option 1: AWS Amplify** (Easy setup)
- Vercel-like experience with automatic CI/CD
- Connect repo and deploy in minutes
- Built-in preview deployments

**Option 2: S3 + CloudFront** (Full control)
- S3 bucket setup with CORS for Module Federation
- CloudFront distribution with SPA routing
- Cache strategy for remoteEntry.js
- GitHub Actions workflow for AWS

## Dependency Management

Shared dependencies are in **root `package.json`** (not in individual packages):

```
root/package.json         → react, antd, vite (shared)
packages/crm-host/        → scripts only, no deps
packages/cashapps-remote/ → scripts only, no deps
```

**Why?**
- Single source of truth for versions
- Prevents version drift between host and remote
- Critical for Module Federation singleton sharing

**Note for deployment:**
- **Vercel**: Auto-detects `pnpm-workspace.yaml` and installs from root automatically
- **AWS/Docker**: Must run `pnpm install` at root before building packages

## Important Notes

- **Build mode required**: vite-plugin-federation only generates `remoteEntry.js` during build
- **CORS critical**: Remote must allow requests from host origin
- **Cache remoteEntry.js carefully**: Short TTL for quick updates
