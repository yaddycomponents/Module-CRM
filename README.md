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

- **crm-host**: Main CRM application (host)
- **cashapps-remote**: Cash Application module (remote)
- **growcomponents-module**: Shared component library

## Getting Started

```bash
# Install dependencies
pnpm install

# Build and run
pnpm dev

# Access
# Host: http://localhost:3000
# Remote: http://localhost:5001
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
