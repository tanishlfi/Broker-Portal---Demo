# Vercel Deployment Guide - Native Monorepo Support

## Architecture

Deploy as a **single Vercel project** using Vercel's native monorepo detection:

- **Client Connect FrontEnd** → `https://broker-portal-demo.vercel.app/` (root)
- **Broker Portal Frontend** → `https://broker-portal-demo.vercel.app/broker` (sub-path)

## How It Works

The root `package.json` defines workspaces for both apps. Vercel automatically detects this monorepo structure and:
1. Builds both Next.js apps independently
2. Routes requests based on `vercel.json` configuration
3. Deploys everything as a single project

## Deployment Steps

### 1. Vercel Configuration

In Vercel Dashboard:
- **New Project** → Import from GitHub
- **Repository:** tanishlfi/Broker-Portal---Demo
- **Root Directory:** Leave empty (monorepo root)
- **Framework:** Auto-detect (will detect Next.js)
- **Build Command:** Leave default (Vercel will auto-detect)
- **Environment Variables:**
  ```
  NEXT_PUBLIC_BROKER_PORTAL_URL=https://broker-portal-demo.vercel.app/broker
  NEXT_PUBLIC_CLIENT_CONNECT_URL=https://broker-portal-demo.vercel.app
  ```
- **Deploy**

### 2. What Happens During Build

Vercel will:
1. Detect `package.json` with workspaces
2. Install dependencies for both apps
3. Build Client Connect FrontEnd
4. Build Broker Portal Frontend (with `/broker` basePath)
5. Route requests using `vercel.json`

## Navigation Flow

1. User lands on `https://broker-portal-demo.vercel.app`
2. Clicks "Broker Portal" button → redirects to `https://broker-portal-demo.vercel.app/broker`
3. In Broker Portal, clicks "Back to Client Connect" → redirects to `https://broker-portal-demo.vercel.app`

## Local Development

**Terminal 1 - Client Connect (port 4200):**
```bash
cd "Client Connect FrontEnd"
npm run dev
```

**Terminal 2 - Broker Portal (port 3000):**
```bash
cd Broker-Portal-Frontend
npm run dev
```

Or use the root workspace scripts:
```bash
npm run dev:client
npm run dev:broker
```

## Files Structure

```
.
├── package.json (root - defines workspaces)
├── vercel.json (routing configuration)
├── Client Connect FrontEnd/
│   ├── package.json
│   ├── next.config.js
│   └── ...
└── Broker-Portal-Frontend/
    ├── package.json
    ├── next.config.ts (with /broker basePath in production)
    └── ...
```
