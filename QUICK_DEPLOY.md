# Quick Deployment Steps - vivekanjan.com

## ✅ Pre-Deployment Verification

### 1. Verify Branch is Pushed
```bash
git branch -vv
# Should show: titanwork_prod [origin/titanwork_prod]
```

### 2. Verify No Build Errors Locally
```bash
cd frontend/react-app
npm run build
# Should complete without errors
```

If build fails, check for:
- TypeScript errors: `npx tsc --noEmit`
- Missing dependencies: `npm install`

---

## 🚀 Frontend Deployment (Vercel)

### Option 1: Auto-Deploy from Vercel Dashboard (Easiest)

1. **Go to**: https://vercel.com/dashboard
2. **Select Project**: `vivekanjan.com`
3. **Click on "Deployments" tab**
4. **Look for `titanwork_prod` branch**
5. **Click "Redeploy"** on the latest commit
6. **Wait for build to complete** (5-10 minutes)

### Option 2: Deploy via CLI

```bash
cd "C:\Users\Administrator\Desktop\XFreeLancer.com\Projects\Building\vivekanjan.com"

# Install Vercel CLI (if not already)
npm install -g vercel

# Deploy production build
vercel --prod --token your_vercel_token

# Note: Get token from https://vercel.com/account/tokens
```

### Option 3: GitHub Auto-Deploy

1. Go to **GitHub**: https://github.com/cforcoder21/vivekanjan.com
2. Click on **"Deployments"** tab
3. You should see Vercel deployment history
4. Enable auto-deploy if not already enabled

---

## 🔑 Configure Environment Variables in Vercel

**BEFORE deployment completes, set these variables:**

1. **Go to Vercel Dashboard** → Your Project
2. **Settings** → **Environment Variables**
3. **Add these variables:**

```
Name: VITE_API_BASE_URL
Value: http://127.0.0.1:3212  (or your backend URL once deployed)

Name: VITE_RAZORPAY_KEY_ID
Value: rzp_test_1DP5MMOZF3MrJt

Name: VITE_CLERK_PUBLISHABLE_KEY
Value: pk_test_bm90YWJsZS1wb3NzdW0tMi5jbGVyay5hY2NvdW50cy5kZXYk
```

4. **Click "Save"**
5. **Go to "Deployments"**
6. **Find your latest deployment**
7. **Click the 3 dots → "Redeploy"**

---

## 🗄️ Backend Deployment

### Step 1: Prepare Backend

```bash
cd backend

# Check if .env.example exists
cat .env.example

# Create .env with production values
# DATABASE_URL=your_production_database_url
# JWT_SECRET=your_secret_key_here
# NODE_ENV=production
```

### Step 2: Deploy to Firebase Cloud Run (Recommended)

```bash
# Install Firebase CLI
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize (if not done)
firebase init

# Deploy
firebase deploy --only functions
```

**Backend URL will be**: `https://{region}-{project-id}.cloudfunctions.net`

### Step 3: Or Deploy to Railway (Simpler)

1. Go to: https://railway.app
2. New Project → Deploy from GitHub repo
3. Select: `cforcoder21/vivekanjan.com`
4. Root Directory: `backend`
5. Add variables (from Railway dashboard):
   - `NODE_ENV=production`
   - `JWT_SECRET=your-secret`
   - `DATABASE_URL=your-database-url`
6. Deploy

**Backend URL will be**: `https://vivekanjan-api.railway.app` (or similar)

---

## 💾 Database Migration (IMPORTANT)

**After backend is deployed, run this migration:**

### For PostgreSQL:

```bash
# Connect to your production database
psql -h your-host -U your-username -d vivekanjan << EOF

ALTER TABLE users ADD COLUMN username TEXT NOT NULL UNIQUE DEFAULT '';
UPDATE users SET username = 'user_' || id WHERE username = '';

EOF
```

### Using Cloud SQL Proxy (for managed databases):

```bash
# Start proxy
cloud_sql_proxy -instances=project:region:instance &

# Run migration
psql -h 127.0.0.1 -U postgres -d vivekanjan -f backend/src/schema.sql
```

---

## 🔄 Update Frontend with Backend URL

**Once backend is deployed:**

1. **Get your backend URL** (e.g., `https://api.vivekanjan.com`)
2. **Go to Vercel Dashboard**
3. **Project Settings** → **Environment Variables**
4. **Update**: `VITE_API_BASE_URL` = your backend URL
5. **Go to "Deployments"**
6. **Redeploy the latest deployment**

---

## ✔️ Verify Deployment

### Test Frontend
```bash
# Visit your deployed site
https://vivekanjan.com

# Check in browser console (F12)
# Should see no errors
# API calls should go to your backend URL
```

### Test Backend Health
```bash
# In PowerShell
$r = Invoke-WebRequest -Uri "https://your-backend-url/health"
$r.Content

# Should return: {"status":"ok","database":"ready"}
```

### Test Signup/Signin
1. Go to login page
2. Try signup with username
3. Try signin with username
4. Try Google OAuth button

---

## 📊 Deployment Status

| Component | Status | URL |
|-----------|--------|-----|
| Frontend | `Ready to Deploy` | https://vercel.com/dashboard |
| Backend | `Ready to Deploy` | Firebase / Railway |
| Database | `Needs Migration` | Add username column |
| GitHub Branch | `✅ Pushed` | titanwork_prod |

---

## 🆘 Troubleshooting

### Build Failed on Vercel
```
Error: Cannot find module '@clerk/clerk-react'
```
**Solution**: Run in root:
```bash
cd frontend/react-app && npm install
cd ..
```

### API Connection Failed
```
cors error or 404
```
**Solution**: 
- Check VITE_API_BASE_URL in Vercel env vars
- Check backend is running
- Check firewall rules

### Database Connection Failed
```
Connection refused
```
**Solution**:
- Check DATABASE_URL format
- Check firewall allows your backend IP
- Verify credentials

---

## 📝 Quick Reference

**Vercel Dashboard**: https://vercel.com/dashboard
**GitHub Repo**: https://github.com/cforcoder21/vivekanjan.com
**GitHub Branch**: titanwork_prod
**Railway Dashboard**: https://railway.app/dashboard
**Firebase Console**: https://console.firebase.google.com

---

## Next Steps After Deployment

1. ✅ Test all features
2. ✅ Monitor error logs
3. ✅ Set up email notifications
4. ✅ Configure custom domain
5. ✅ Set up SSL (automatic with Vercel)
6. ✅ Plan database backups

---

**Need help with specific step?** Let me know which platform you're choosing for backend!
