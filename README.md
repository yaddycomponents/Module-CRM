# Module-CRM

A Module Federation demo showcasing micro-frontend architecture with React, Antd, and pnpm workspaces.

## Architecture

```
┌─────────────────────────────────────────┐
│         CRM Host (:5000)                │
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
# Host: http://localhost:5000
# Remote: http://localhost:5001
```

## Key Features

- Runtime Module Federation with Vite
- Shared theme and components
- IKEA pattern for route sharing
- DevTools panel for debugging federation
