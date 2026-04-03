# Vercel Frontend Deployment Guide

## Overview
This document guides you through deploying the Vivek Anjan website frontend to Vercel.

## Current Status
- Frontend: Ready for deployment ✓
- Code: Pushed to GitHub (titanwork_prod branch) ✓
- Build: Verified working ✓
- OAuth: Configured with Clerk ✓

## Vercel Deployment Steps

### Step 1: Import Project to Vercel
1. Go to https://vercel.com
2. Click "New Project" or sign in if needed
3. Click "Import Git Repository"
4. Search for: `cforcoder21/vivekanjan.com`
5. Select the repository
6. Click "Import"

### Step 2: Configure Build Settings
In the "Create Project" dialog, set:

**Project Name:** vivekanjan (or your choice)

**Framework Preset:** Vite (should auto-detect)

**Root Directory:** `./frontend/react-app`

**Build Command:** `npm run build`

**Output Directory:** `dist`

**Install Command:** `npm install`

### Step 3: Environment Variables
Add these environment variables in Vercel dashboard:

**Production Environment:**
```
VITE_API_BASE_URL = https://your-backend-url.railway.app
VITE_RAZORPAY_KEY_ID = rzp_test_1DP5MMOZF3MrJt
VITE_CLERK_PUBLISHABLE_KEY = pk_test_bm90YWJsZS1wb3NzdW0tMi5jbGVyay5hY2NvdW50cy5kZXYk
```

**Note:** Replace `https://your-backend-url.railway.app` with your actual backend URL after deploying backend.

### Step 4: Deploy
1. Click "Deploy"
2. Vercel will automatically build and deploy
3. Wait for build to complete (usually 2-3 minutes)
4. Once successful, you'll get a production URL

### Step 5: Configure Custom Domain (Optional)
1. In Vercel dashboard → Settings → Domains
2. Add your custom domain: `vivekanjan.com`
3. Follow DNS configuration instructions
4. Point your domain registrar DNS to Vercel

## Post-Deployment Configuration

### Backend URL Update
After deploying backend to Railway/Firebase:
1. Go to Vercel Project Settings
2. Environment Variables
3. Update `VITE_API_BASE_URL` with production backend URL
4. Vercel will automatically re-deploy

### Clerk Configuration
1. Go to Clerk Dashboard
2. Update "Allowed Origins" to include your Vercel URL:
   - Production: `https://vivekanjan.com` (or your Vercel URL)
   - Development: `http://localhost:5324`

### Razorpay Configuration
1. Update Razorpay credentials in environment variables when you get production keys from client
2. Test payments in production

## Troubleshooting

### Build Fails
- Check that all dependencies are in `package.json`
- Verify Node.js version is 18+ (Vercel default)
- Check `npm run build` works locally first

### Environment Variables Not Loading
- Rebuild deployment after changing env vars
- Clear Vercel cache if needed (Project Settings → Redeploy)

### Clerk OAuth Not Working
- Verify Clerk publishable key is correct
- Check "Allowed Origins" in Clerk dashboard
- Clear browser cache and cookies

## Deployment Complete ✓

Your frontend should now be live at: `https://your-vercel-url.vercel.app`

For custom domain, navigate to your registered domain after DNS configuration.
