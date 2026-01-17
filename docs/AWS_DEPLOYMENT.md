# AWS Deployment Guide

This guide covers deploying Module Federation apps to AWS using either:
- **AWS Amplify** - Easy setup, Vercel-like experience
- **S3 + CloudFront** - Full control, production-grade

---

## Option 1: AWS Amplify (Recommended for Quick Setup)

AWS Amplify provides a Vercel-like experience with automatic CI/CD.

### Setup Steps

1. Go to [AWS Amplify Console](https://console.aws.amazon.com/amplify)
2. Click "New app" → "Host web app"
3. Connect your GitHub repository
4. Configure build settings for each package

### amplify.yml Configuration

Create `amplify.yml` in each package:

**packages/cashapps-remote/amplify.yml**:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - cd ../.. && pnpm install
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - ../../node_modules/**/*
      - node_modules/**/*
```

**packages/crm-host/amplify.yml**:
```yaml
version: 1
frontend:
  phases:
    preBuild:
      commands:
        - npm install -g pnpm
        - cd ../.. && pnpm install
    build:
      commands:
        - pnpm build
  artifacts:
    baseDirectory: dist
    files:
      - '**/*'
  cache:
    paths:
      - ../../node_modules/**/*
      - node_modules/**/*
```

### Environment Variables

In Amplify Console → App settings → Environment variables:

| Variable | Value |
|----------|-------|
| `VITE_REMOTE_URL` | `https://remote-app.amplifyapp.com/assets/remoteEntry.js` |

### SPA Routing (Rewrites)

In Amplify Console → App settings → Rewrites and redirects:

| Source | Target | Type |
|--------|--------|------|
| `</^[^.]+$\|\.(?!(css\|gif\|ico\|jpg\|js\|png\|txt\|svg\|woff\|woff2\|ttf\|map\|json)$)([^.]+$)/>` | `/index.html` | 200 (Rewrite) |

### Amplify Pros & Cons

| Pros | Cons |
|------|------|
| Easy setup | Less control over caching |
| Automatic CI/CD | Monorepo support can be tricky |
| Preview deployments | Slightly higher cost at scale |
| Built-in SSL | |

---

## Option 2: S3 + CloudFront (Full Control)

For production apps requiring fine-grained control over caching, CDN, and infrastructure.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                            │
│  ┌─────────────────────┐       ┌─────────────────────────────┐  │
│  │   crm-host.domain   │       │   cashapps-remote.domain    │  │
│  │   Distribution A    │       │   Distribution B            │  │
│  └──────────┬──────────┘       └──────────────┬──────────────┘  │
└─────────────┼──────────────────────────────────┼────────────────┘
              │                                  │
              ▼                                  ▼
       ┌──────────────┐                  ┌──────────────┐
       │  S3 Bucket   │    fetches       │  S3 Bucket   │
       │  crm-host    │ ──────────────►  │  cashapps    │
       │              │  remoteEntry.js  │  remote      │
       └──────────────┘                  └──────────────┘
```

## Prerequisites

- AWS CLI configured with appropriate credentials
- Two S3 buckets (one per package)
- Two CloudFront distributions (one per package)
- Route 53 or external DNS for custom domains (optional)

## S3 Bucket Configuration

### Create Buckets

```bash
# Create buckets
aws s3 mb s3://crm-host-bucket --region us-east-1
aws s3 mb s3://cashapps-remote-bucket --region us-east-1
```

### Enable Static Website Hosting

```bash
aws s3 website s3://crm-host-bucket --index-document index.html --error-document index.html
aws s3 website s3://cashapps-remote-bucket --index-document index.html --error-document index.html
```

### CORS Configuration (Critical for Module Federation)

The remote bucket MUST have CORS enabled so the host can fetch `remoteEntry.js`.

Create `cors.json`:

```json
{
  "CORSRules": [
    {
      "AllowedOrigins": [
        "https://crm-host.yourdomain.com",
        "http://localhost:5000"
      ],
      "AllowedMethods": ["GET", "HEAD"],
      "AllowedHeaders": ["*"],
      "ExposeHeaders": ["ETag"],
      "MaxAgeSeconds": 3000
    }
  ]
}
```

Apply CORS configuration:

```bash
aws s3api put-bucket-cors --bucket cashapps-remote-bucket --cors-configuration file://cors.json
```

### Bucket Policy

Create `bucket-policy.json`:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::cashapps-remote-bucket/*"
    }
  ]
}
```

Apply policy:

```bash
aws s3api put-bucket-policy --bucket cashapps-remote-bucket --policy file://bucket-policy.json
```

## CloudFront Configuration

### Create Distribution

Key settings for each distribution:

| Setting | Value |
|---------|-------|
| Origin Domain | `bucket-name.s3.amazonaws.com` |
| Origin Access | Origin Access Control (OAC) |
| Viewer Protocol | Redirect HTTP to HTTPS |
| Cache Policy | CachingOptimized (or custom) |
| Error Pages | 404 → /index.html (200) |

### SPA Routing (Error Pages)

Configure custom error responses for SPA routing:

| HTTP Error Code | Response Page Path | HTTP Response Code |
|-----------------|-------------------|-------------------|
| 403 | /index.html | 200 |
| 404 | /index.html | 200 |

### Cache Strategy for Module Federation

Create a custom cache policy for `remoteEntry.js`:

**For remoteEntry.js** (short cache for quick updates):
```
Cache-Control: public, max-age=300, s-maxage=300
```

**For other assets** (long cache with content hashing):
```
Cache-Control: public, max-age=31536000, immutable
```

You can achieve this with CloudFront Cache Behaviors:

| Path Pattern | Cache Policy |
|--------------|--------------|
| `/assets/remoteEntry.js` | Custom (5 min TTL) |
| `/assets/*` | CachingOptimized (1 year) |
| `*` | CachingOptimized |

## Environment Variables

### Host Application

Set `VITE_REMOTE_URL` to point to the CloudFront distribution of the remote:

```bash
# .env.production
VITE_REMOTE_URL=https://d1234567890.cloudfront.net/assets/remoteEntry.js
```

Or with custom domain:

```bash
VITE_REMOTE_URL=https://cashapps-remote.yourdomain.com/assets/remoteEntry.js
```

## GitHub Actions Workflow

Create `.github/workflows/deploy-aws.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  workflow_dispatch:
    inputs:
      deploy_target:
        description: 'What to deploy'
        required: true
        default: 'both'
        type: choice
        options:
          - both
          - remote-only
          - host-only

env:
  AWS_REGION: us-east-1

jobs:
  changes:
    name: Detect Changes
    runs-on: ubuntu-latest
    outputs:
      remote: ${{ steps.filter.outputs.remote }}
      host: ${{ steps.filter.outputs.host }}
    steps:
      - uses: actions/checkout@v4
      - uses: dorny/paths-filter@v3
        id: filter
        with:
          filters: |
            remote:
              - 'packages/cashapps-remote/**'
              - 'packages/growcomponents/**'
            host:
              - 'packages/crm-host/**'
              - 'packages/growcomponents/**'

  deploy-remote:
    name: Deploy CashApps Remote to AWS
    runs-on: ubuntu-latest
    needs: changes
    if: |
      (github.event_name == 'workflow_dispatch' && (inputs.deploy_target == 'both' || inputs.deploy_target == 'remote-only')) ||
      (github.event_name != 'workflow_dispatch' && needs.changes.outputs.remote == 'true')
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        working-directory: packages/cashapps-remote
        run: pnpm build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: |
          aws s3 sync packages/cashapps-remote/dist/ s3://${{ secrets.S3_BUCKET_REMOTE }} \
            --delete \
            --cache-control "public, max-age=31536000, immutable"

          # Set short cache for remoteEntry.js
          aws s3 cp s3://${{ secrets.S3_BUCKET_REMOTE }}/assets/remoteEntry.js \
            s3://${{ secrets.S3_BUCKET_REMOTE }}/assets/remoteEntry.js \
            --metadata-directive REPLACE \
            --cache-control "public, max-age=300"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_REMOTE }} \
            --paths "/assets/remoteEntry.js" "/"

  deploy-host:
    name: Deploy CRM Host to AWS
    runs-on: ubuntu-latest
    needs: [changes, deploy-remote]
    if: |
      always() &&
      (needs.deploy-remote.result == 'success' || needs.deploy-remote.result == 'skipped') &&
      (
        (github.event_name == 'workflow_dispatch' && (inputs.deploy_target == 'both' || inputs.deploy_target == 'host-only')) ||
        (github.event_name != 'workflow_dispatch' && needs.changes.outputs.host == 'true')
      )
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 9

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'

      - name: Install dependencies
        run: pnpm install

      - name: Build
        working-directory: packages/crm-host
        env:
          VITE_REMOTE_URL: ${{ secrets.VITE_REMOTE_URL }}
        run: pnpm build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}

      - name: Deploy to S3
        run: |
          aws s3 sync packages/crm-host/dist/ s3://${{ secrets.S3_BUCKET_HOST }} \
            --delete \
            --cache-control "public, max-age=31536000, immutable"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CF_DISTRIBUTION_HOST }} \
            --paths "/*"
```

## Required GitHub Secrets

| Secret | Description |
|--------|-------------|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `S3_BUCKET_REMOTE` | S3 bucket name for cashapps-remote |
| `S3_BUCKET_HOST` | S3 bucket name for crm-host |
| `CF_DISTRIBUTION_REMOTE` | CloudFront distribution ID for remote |
| `CF_DISTRIBUTION_HOST` | CloudFront distribution ID for host |
| `VITE_REMOTE_URL` | Full URL to remoteEntry.js on CloudFront |

## IAM Policy

Minimum permissions for the deployment user:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:GetObject",
        "s3:DeleteObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::crm-host-bucket",
        "arn:aws:s3:::crm-host-bucket/*",
        "arn:aws:s3:::cashapps-remote-bucket",
        "arn:aws:s3:::cashapps-remote-bucket/*"
      ]
    },
    {
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": [
        "arn:aws:cloudfront::ACCOUNT_ID:distribution/CF_DIST_HOST",
        "arn:aws:cloudfront::ACCOUNT_ID:distribution/CF_DIST_REMOTE"
      ]
    }
  ]
}
```

## Troubleshooting

### CORS Errors

If you see CORS errors in the browser console:

1. Verify S3 bucket CORS configuration includes the host origin
2. Check CloudFront is forwarding Origin header
3. Ensure bucket policy allows public read access

```bash
# Test CORS
curl -H "Origin: https://crm-host.yourdomain.com" \
     -H "Access-Control-Request-Method: GET" \
     -I https://cashapps-remote.yourdomain.com/assets/remoteEntry.js
```

### Cache Issues

If changes aren't appearing after deployment:

1. Invalidate CloudFront cache
2. Check `remoteEntry.js` has short cache TTL
3. Hard refresh browser (Cmd+Shift+R / Ctrl+Shift+R)

```bash
# Force invalidation
aws cloudfront create-invalidation \
  --distribution-id YOUR_DIST_ID \
  --paths "/*"
```

### 404 on Refresh

If routes return 404 on refresh:

1. Configure CloudFront error pages (404 → /index.html with 200 status)
2. Or use Lambda@Edge for more control

## Cost Optimization

- Use S3 Intelligent-Tiering for infrequent access patterns
- Set appropriate cache TTLs to reduce origin requests
- Use CloudFront Price Class based on user geography
- Monitor with CloudWatch and set up billing alerts
