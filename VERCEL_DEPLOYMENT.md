# Vercel Deployment Guide - Separate Projects (Recommended)

## Architecture

Deploy as **2 separate Vercel projects** for maximum stability:

- **Client Connect FrontEnd** → `https://client-connect-demo.vercel.app`
- **Broker Portal Frontend** → `https://broker-portal-demo.vercel.app`

## Why Separate Projects?

- ✅ Each app builds independently
- ✅ No routing conflicts
- ✅ Easier to debug and maintain
- ✅ Better performance (no shared serverless functions)
- ✅ Vercel's recommended approach for monorepos

## Deployment Steps

### 1. Delete Current Project
Delete the current monorepo project from Vercel dashboard.

### 2. Create Client Connect FrontEnd Project

In Vercel:
- **New Project** → Import from GitHub
- **Repository:** tanishlfi/Broker-Portal---Demo
- **Root Directory:** `Client Connect FrontEnd`
- **Framework:** Next.js
- **Environment Variables:**
  ```
  NEXT_PUBLIC_BROKER_PORTAL_URL=https://broker-portal-demo.vercel.app
  NEXT_PUBLIC_CLIENT_CONNECT_URL=https://client-connect-demo.vercel.app
  ```
- **Deploy**

### 3. Create Broker Portal Frontend Project

In Vercel:
- **New Project** → Import from GitHub
- **Repository:** tanishlfi/Broker-Portal---Demo
- **Root Directory:** `Broker-Portal-Frontend`
- **Framework:** Next.js
- **Environment Variables:**
  ```
  NEXT_PUBLIC_BROKER_PORTAL_URL=https://broker-portal-demo.vercel.app
  NEXT_PUBLIC_CLIENT_CONNECT_URL=https://client-connect-demo.vercel.app
  ```
- **Deploy**

## Update Next.js Config

Remove the `/broker` basePath from Broker Portal since it will be on its own domain:

**Broker-Portal-Frontend/next.config.ts:**
```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {};

export default nextConfig;
```

## Navigation Flow

1. User lands on `https://client-connect-demo.vercel.app`
2. Clicks "Broker Portal" button → redirects to `https://broker-portal-demo.vercel.app`
3. In Broker Portal, clicks "Back to Client Connect" → redirects to `https://client-connect-demo.vercel.app`

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

## Environment Variables

Both apps use environment variables pointing to each other's Vercel URLs for seamless cross-app navigation.
