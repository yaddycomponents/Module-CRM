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

## AWS Deployment Guide

If deploying to AWS (S3 + CloudFront) instead of Vercel, the same core issues apply but require different solutions.

### AWS Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CloudFront                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ crm-host     │  │ cashapps     │  │ vanilla      │          │
│  │ Distribution │  │ Distribution │  │ Distribution │          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
└─────────┼─────────────────┼─────────────────┼───────────────────┘
          │                 │                 │
          ▼                 ▼                 ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ S3 Bucket    │    │ S3 Bucket    │    │ S3 Bucket    │
│ crm-host     │    │ cashapps     │    │ vanilla      │
└──────────────┘    └──────────────┘    └──────────────┘
```

### S3 Bucket Configuration

Each app needs its own S3 bucket with static website hosting:

```bash
# Create bucket
aws s3 mb s3://your-app-name --region us-east-1

# Enable static website hosting
aws s3 website s3://your-app-name \
  --index-document index.html \
  --error-document index.html

# Upload build
aws s3 sync dist/ s3://your-app-name --delete
```

**Bucket Policy (for CloudFront access):**

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontAccess",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-app-name/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::ACCOUNT_ID:distribution/DISTRIBUTION_ID"
        }
      }
    }
  ]
}
```

### CloudFront Distribution Settings

#### Origin Settings
- **Origin Domain:** `your-app-name.s3.us-east-1.amazonaws.com`
- **Origin Access:** Origin Access Control (OAC) - recommended over OAI

#### Cache Behaviors

You need **3 behaviors** (order matters - most specific first):

| Priority | Path Pattern | Cache Policy | Origin Request Policy |
|----------|-------------|--------------|----------------------|
| 0 | `/mf-manifest.json` | CachingDisabled | CORS-S3Origin |
| 1 | `/remoteEntry.js` | CachingDisabled | CORS-S3Origin |
| 2 | `/assets/*` | CachingOptimized | CORS-S3Origin |
| 3 | `Default (*)` | CachingOptimized | - |

#### SPA Fallback (Custom Error Response)

**Important:** Unlike Vercel, CloudFront's error responses apply to ALL paths. To avoid breaking MF files:

**Option 1: Use Lambda@Edge (Recommended)**

```javascript
// Lambda@Edge - Origin Response
exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  const request = event.Records[0].cf.request;
  const uri = request.uri;

  // Don't modify MF files or assets
  if (uri === '/mf-manifest.json' ||
      uri === '/remoteEntry.js' ||
      uri.startsWith('/assets/')) {
    return response;
  }

  // SPA fallback for other 404s
  if (response.status === '404' || response.status === '403') {
    return {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'content-type': [{ value: 'text/html' }],
        'cache-control': [{ value: 'no-cache' }]
      },
      body: `<!-- Fetch index.html from S3 and return -->`
    };
  }

  return response;
};
```

**Option 2: CloudFront Function (Simpler)**

```javascript
// CloudFront Function - Viewer Request
function handler(event) {
  var request = event.request;
  var uri = request.uri;

  // Don't rewrite MF files
  if (uri === '/mf-manifest.json' ||
      uri === '/remoteEntry.js' ||
      uri.startsWith('/assets/')) {
    return request;
  }

  // Rewrite paths without extensions to index.html
  if (!uri.includes('.')) {
    request.uri = '/index.html';
  }

  return request;
}
```

### Response Headers Policy

Create a custom response headers policy for CORS:

```json
{
  "Name": "MF-CORS-Headers",
  "CorsConfig": {
    "AccessControlAllowOrigins": {
      "Items": ["*"]
    },
    "AccessControlAllowHeaders": {
      "Items": ["*"]
    },
    "AccessControlAllowMethods": {
      "Items": ["GET", "HEAD", "OPTIONS"]
    },
    "AccessControlAllowCredentials": false,
    "OriginOverride": true
  },
  "CustomHeadersConfig": {
    "Items": []
  }
}
```

Apply different cache headers per behavior:

| Path Pattern | Cache-Control Header |
|-------------|---------------------|
| `/mf-manifest.json` | `public, max-age=0, must-revalidate` |
| `/remoteEntry.js` | `public, max-age=0, must-revalidate` |
| `/assets/*` | `public, max-age=31536000, immutable` |

### GitHub Actions for AWS Deployment

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 9

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        run: pnpm build
        env:
          VITE_BASE_URL: https://your-cloudfront-domain.cloudfront.net

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: us-east-1

      - name: Deploy to S3
        run: |
          aws s3 sync packages/crm-host/dist/ s3://crm-host-bucket --delete

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### Terraform Configuration (Infrastructure as Code)

```hcl
# S3 Bucket
resource "aws_s3_bucket" "app" {
  bucket = "your-mf-app"
}

resource "aws_s3_bucket_website_configuration" "app" {
  bucket = aws_s3_bucket.app.id

  index_document {
    suffix = "index.html"
  }

  error_document {
    key = "index.html"
  }
}

# CloudFront Distribution
resource "aws_cloudfront_distribution" "app" {
  enabled             = true
  default_root_object = "index.html"

  origin {
    domain_name              = aws_s3_bucket.app.bucket_regional_domain_name
    origin_id                = "S3Origin"
    origin_access_control_id = aws_cloudfront_origin_access_control.app.id
  }

  # MF Manifest - no cache
  ordered_cache_behavior {
    path_pattern     = "/mf-manifest.json"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    cache_policy_id            = data.aws_cloudfront_cache_policy.disabled.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id

    viewer_protocol_policy = "redirect-to-https"
  }

  # Remote Entry - no cache
  ordered_cache_behavior {
    path_pattern     = "/remoteEntry.js"
    allowed_methods  = ["GET", "HEAD", "OPTIONS"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    cache_policy_id            = data.aws_cloudfront_cache_policy.disabled.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id

    viewer_protocol_policy = "redirect-to-https"
  }

  # Assets - long cache
  ordered_cache_behavior {
    path_pattern     = "/assets/*"
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    cache_policy_id            = data.aws_cloudfront_cache_policy.optimized.id
    response_headers_policy_id = aws_cloudfront_response_headers_policy.cors.id

    viewer_protocol_policy = "redirect-to-https"
  }

  # Default behavior
  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    cache_policy_id = data.aws_cloudfront_cache_policy.optimized.id

    viewer_protocol_policy = "redirect-to-https"

    function_association {
      event_type   = "viewer-request"
      function_arn = aws_cloudfront_function.spa_rewrite.arn
    }
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# CloudFront Function for SPA routing
resource "aws_cloudfront_function" "spa_rewrite" {
  name    = "spa-rewrite"
  runtime = "cloudfront-js-1.0"
  code    = <<-EOF
    function handler(event) {
      var request = event.request;
      var uri = request.uri;

      if (uri === '/mf-manifest.json' ||
          uri === '/remoteEntry.js' ||
          uri.startsWith('/assets/')) {
        return request;
      }

      if (!uri.includes('.')) {
        request.uri = '/index.html';
      }

      return request;
    }
  EOF
}

# CORS Response Headers Policy
resource "aws_cloudfront_response_headers_policy" "cors" {
  name = "mf-cors-policy"

  cors_config {
    access_control_allow_origins {
      items = ["*"]
    }
    access_control_allow_headers {
      items = ["*"]
    }
    access_control_allow_methods {
      items = ["GET", "HEAD", "OPTIONS"]
    }
    access_control_allow_credentials = false
    origin_override                  = true
  }
}
```

### AWS vs Vercel Comparison

| Feature | Vercel | AWS (S3 + CloudFront) |
|---------|--------|----------------------|
| Setup complexity | Simple (vercel.json) | Complex (multiple services) |
| SPA fallback | Built-in rewrites | Lambda@Edge or CloudFront Function |
| CORS headers | vercel.json headers | Response Headers Policy |
| Cache control | vercel.json headers | Cache Behaviors + Policies |
| Deployment | Git push auto-deploy | GitHub Actions + S3 sync |
| Cost | Free tier, then per-seat | Pay-per-use (often cheaper at scale) |
| Custom domains | Easy | Route53 + ACM certificates |
| Edge functions | Vercel Functions | Lambda@Edge / CloudFront Functions |

### AWS Deployment Checklist

- [ ] S3 bucket created with static website hosting
- [ ] CloudFront distribution with OAC to S3
- [ ] Cache behaviors for `/mf-manifest.json`, `/remoteEntry.js`, `/assets/*`
- [ ] Response headers policy with CORS enabled
- [ ] CloudFront Function or Lambda@Edge for SPA routing (excluding MF files)
- [ ] Cache invalidation in CI/CD pipeline
- [ ] `getPublicPath` set to CloudFront domain URL
- [ ] Environment variables for remote URLs pointing to CloudFront domains

---

## Resources

- [@module-federation/vite](https://github.com/module-federation/vite)
- [Module Federation 2.0 Docs](https://module-federation.io/)
- [Vercel Headers Configuration](https://vercel.com/docs/projects/project-configuration#headers)
- [CloudFront Cache Behaviors](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/distribution-web-values-specify.html#DownloadDistValuesCacheBehavior)
- [Lambda@Edge](https://docs.aws.amazon.com/lambda/latest/dg/lambda-edge.html)
- [CloudFront Functions](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/cloudfront-functions.html)
