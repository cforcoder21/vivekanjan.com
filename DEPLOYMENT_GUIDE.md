# Deployment Guide - vivekanjan.com

## Part 1: Frontend Deployment (Vercel)

### Step 1: Deploy to Vercel

Since you have Vercel connected to GitHub, deployment is automatic:

1. **Go to Vercel Dashboard**: https://vercel.com/dashboard
2. **Locate Your Project**: `vivekanjan.com`
3. **Select Branch**: Click on "Deployments" tab
4. **Trigger Deploy from `titanwork_prod`**:
   - Click "New Deployment"
   - Select branch: `titanwork_prod`
   - Click "Deploy"

**OR use Vercel CLI:**

```bash
npm install -g vercel
cd frontend/react-app
vercel --prod
```

### Step 2: Configure Environment Variables in Vercel

Go to: **Project Settings → Environment Variables**

Add these environment variables:

```
VITE_API_BASE_URL=your_backend_api_url
VITE_RAZORPAY_KEY_ID=rzp_test_1DP5MMOZF3MrJt
VITE_CLERK_PUBLISHABLE_KEY=pk_test_bm90YWJsZS1wb3NzdW0tMi5jbGVyay5hY2NvdW50cy5kZXYk
```

**Update `VITE_API_BASE_URL`** once you deploy backend (see Part 2)

### Step 3: Deploy Custom Domain (Optional)

1. Go to **Project Settings → Domains**
2. Add your domain: `vivekanjan.com`
3. Follow DNS configuration steps

---

## Part 2: Backend Deployment (Firebase or Alternatives)

### Option A: Firebase Cloud Run (Recommended for Node.js)

#### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

#### 2. Initialize Firebase

```bash
cd backend
firebase init
# Select: Cloud Functions, Firestore, Hosting
```

#### 3. Deploy Backend

```bash
firebase deploy --only functions
```

Your backend will be hosted at: `https://your-project-name.cloudfunctions.net`

#### 4. Update Environment Variables

In **Firebase Console** → **Project Settings** → **Environment Variables**:

```
JWT_SECRET=your-secret-key-here
DATABASE_URL=your_database_connection_string
PORT=8080
HOST=0.0.0.0
```

#### 5. Database Migration (IMPORTANT)

Before API receives traffic, run the migration:

```sql
-- For PostgreSQL:
ALTER TABLE users ADD COLUMN username TEXT NOT NULL UNIQUE DEFAULT '';
UPDATE users SET username = 'user_' || id WHERE username = '';

-- For SQLite (if using):
ALTER TABLE users ADD COLUMN username TEXT UNIQUE;
UPDATE users SET username = 'user_' || id;
```

**For PostgreSQL on managed services (AWS RDS, Google Cloud SQL, etc.):**

```bash
# Using psql:
psql -h your-host -U your-username -d your-database < migration.sql

# Using Cloud SQL Proxy:
cloud_sql_proxy -instances=project:region:instance &
psql -h 127.0.0.1 -U postgres -d vivekanjan < migration.sql
```

---

### Option B: Railway.app (Simpler Alternative)

#### 1. Create Railway Account

Go to: https://railway.app

#### 2. Connect GitHub

1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Connect `cforcoder21/vivekanjan.com`
4. Select `backend` folder

#### 3. Configure Environment

In **Railway Dashboard** → **Variables**:

```
NODE_ENV=production
JWT_SECRET=your-secret-key
PORT=8080
DATABASE_URL=your_postgres_url
```

#### 4. Deploy

Click "Deploy" - Railway auto-deploys from your repo

**Backend URL**: Will be provided by Railway (e.g., `https://vivekanjan-prod.railway.app`)

---

### Option C: Heroku (Classic but Paid)

#### 1. Create Heroku Account

https://www.heroku.com

#### 2. Deploy via CLI

```bash
npm install -g heroku
heroku login
cd backend
heroku create vivekanjan-api-prod
git push heroku main
```

#### 3. Set Environment Variables

```bash
heroku config:set JWT_SECRET=your-secret-key
heroku config:set DATABASE_URL=your_postgres_url
```

---

## Part 3: Database Setup

### If Using PostgreSQL (Production)

1. **Create Database**:
   - AWS RDS, Google Cloud SQL, or Supabase
   
2. **Run Migrations**:

```bash
# For fresh database:
psql -h your-host -U your-username -d vivekanjan -f backend/src/schema.sql

# For existing database (add username column):
psql -h your-host -U your-username -d vivekanjan << EOF
ALTER TABLE users ADD COLUMN username TEXT NOT NULL UNIQUE DEFAULT '';
UPDATE users SET username = 'user_' || id;
EOF
```

3. **Get Connection String**:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/vivekanjan
   ```

### If Using SQLite (Development Only - Not for Production)

Already initialized in `backend/src/initDb-sqlite.js`

---

## Part 4: Update Frontend Configuration

### After Backend Deployed

1. **Get Backend URL** from your deployment (e.g., `https://api.vivekanjan.com`)

2. **Update Vercel Environment Variables**:
   - Go to Vercel Dashboard
   - Project Settings → Environment Variables
   - Update `VITE_API_BASE_URL` to your backend URL

3. **Redeploy Frontend**:
   ```bash
   vercel --prod
   ```

---

## Part 5: Verify Deployment

### Test Frontend

1. Visit: `https://vivekanjan.com`
2. Check console for errors: Press `F12`
3. Test signup/signin with username
4. Test Google OAuth button
5. Test book purchasing flow

### Test Backend

```bash
# Health check
curl https://your-backend-url/health

# Test signup
curl -X POST https://your-backend-url/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "username": "testuser123",
    "password": "securepass123"
  }'

# Test signin
curl -X POST https://your-backend-url/signin \
  -H "Content-Type: application/json" \
  -d '{
    "emailOrUsername": "testuser123",
    "password": "securepass123"
  }'
```

---

## Deployment Checklist

### Before Deployment
- [ ] All changes pushed to `titanwork_prod` branch
- [ ] No TypeScript errors in frontend
- [ ] Environment variables configured
- [ ] Database migrations ready

### Frontend (Vercel)
- [ ] Vercel project connected to GitHub
- [ ] Branch set to `titanwork_prod`
- [ ] Environment variables added
- [ ] Domain configured (optional)
- [ ] Build logs show no errors

### Backend (Choose one)
- [ ] Firebase/Railway/Heroku account created
- [ ] Repository connected
- [ ] Environment variables set
- [ ] Database connected
- [ ] Migrations applied
- [ ] Health check endpoint responding

### Verification
- [ ] Frontend loads without errors
- [ ] API endpoints responding
- [ ] Signup/signin working
- [ ] Google OAuth working
- [ ] Database queries working
- [ ] Razorpay integration working

---

## Rollback Plan

If issues occur during deployment:

1. **Frontend Rollback**:
   - Vercel Dashboard → Deployments
   - Click on previous deployment
   - Click "Redeploy"

2. **Backend Rollback**:
   - Revert to previous commit
   - Redeploy from previous commit
   - Or restore from database backup

---

## Post-Deployment Monitoring

Monitor these services:

1. **Vercel** → Analytics & Logs
2. **Backend Platform** → Logs & Monitoring
3. **Database** → Query performance & connections
4. **Sentry** (optional) → Error tracking

---

## Support & Troubleshooting

### Common Issues

**Problem**: "Cannot find module '@clerk/clerk-react'"
- **Solution**: Run `npm install @clerk/clerk-react` in frontend before building

**Problem**: "CORS error from backend"
- **Solution**: Ensure backend has CORS enabled for your frontend domain

**Problem**: "Database connection refused"
- **Solution**: Check DATABASE_URL, firewall rules, and credentials

**Problem**: "Build timeout on Vercel"
- **Solution**: Check for large dependencies, use Vercel CLI to test locally

---

## Next Steps After Deployment

1. Test all features thoroughly
2. Monitor error logs
3. Set up alerts for downtime
4. Plan for SSL certificates (auto with Vercel/Railway)
5. Set up automated backups (database)
6. Plan for scaling if traffic increases

