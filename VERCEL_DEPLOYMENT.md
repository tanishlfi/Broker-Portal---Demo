# Vercel Deployment Guide

## Overview
This is a monorepo with two Next.js applications:
- **Client Connect FrontEnd** (React) - Main application
- **Broker Portal Frontend** (Next.js) - Broker portal application

## Deployment Strategy

### Option 1: Separate Vercel Projects (Recommended for now)

**Client Connect FrontEnd:**
- Deploy to Vercel as separate project
- URL: `https://client-connect-demo.vercel.app`
- Root Directory: `Client Connect FrontEnd`

**Broker Portal Frontend:**
- Deploy to Vercel as separate project
- URL: `https://broker-portal-demo.vercel.app`
- Root Directory: `Broker-Portal-Frontend`

### Environment Variables

Set these in Vercel project settings for each app:

**Client Connect FrontEnd:**
```
NEXT_PUBLIC_BROKER_PORTAL_URL=https://broker-portal-demo.vercel.app
NEXT_PUBLIC_CLIENT_CONNECT_URL=https://client-connect-demo.vercel.app
```

**Broker Portal Frontend:**
```
NEXT_PUBLIC_BROKER_PORTAL_URL=https://broker-portal-demo.vercel.app
NEXT_PUBLIC_CLIENT_CONNECT_URL=https://client-connect-demo.vercel.app
```

## Deployment Steps

### 1. Create Vercel Projects

**For Client Connect FrontEnd:**
```bash
# In Vercel dashboard:
# - New Project
# - Import from GitHub: tanishlfi/Broker-Portal---Demo
# - Root Directory: Client Connect FrontEnd
# - Framework: Next.js
# - Build Command: npm run build
# - Output Directory: .next
```

**For Broker Portal Frontend:**
```bash
# In Vercel dashboard:
# - New Project
# - Import from GitHub: tanishlfi/Broker-Portal---Demo
# - Root Directory: Broker-Portal-Frontend
# - Framework: Next.js
# - Build Command: npm run build
# - Output Directory: .next
```

### 2. Set Environment Variables

In each Vercel project settings, add the environment variables listed above.

### 3. Deploy

Push to `tanish/changes` branch and Vercel will auto-deploy both projects.

## Navigation Flow

1. User lands on `https://client-connect-demo.vercel.app`
2. Clicks "Broker Portal" button
3. Redirects to `https://broker-portal-demo.vercel.app`
4. In Broker Portal, clicks "Back to Client Connect"
5. Redirects back to `https://client-connect-demo.vercel.app`

## Local Development

**Terminal 1 - Client Connect FrontEnd (port 4200):**
```bash
cd "Client Connect FrontEnd"
npm run dev
# Runs on http://localhost:4200
```

**Terminal 2 - Broker Portal Frontend (port 3000):**
```bash
cd Broker-Portal-Frontend
npm run dev
# Runs on http://localhost:3000
```

## Files Modified

- `Client Connect FrontEnd/components/Dashboards/UserCards.jsx` - Added Broker Portal button routing
- `Client Connect FrontEnd/components/Containers/FeatureCard.jsx` - Added external link support
- `Broker-Portal-Frontend/components/layout/Sidebar.tsx` - Added back button to Client Connect
- `Broker-Portal-Frontend/next.config.ts` - Conditional basePath for production
- `Broker-Portal-Frontend/lib/constants.ts` - Updated routes
- `.env.production` files - Environment variables for production

## Notes

- URLs in `.env.production` should be updated with actual Vercel deployment URLs
- Each app maintains its own deployment and can be scaled independently
- CORS should be configured if needed for API calls between apps
