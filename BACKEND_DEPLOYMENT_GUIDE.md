# Backend Deployment Guide - Railway/Firebase

## Overview
This guide covers deploying the Node.js/Express backend to Railway or Firebase.

## Recommended: Railway Deployment

Railway is simpler and better for Node.js backends.

### Prerequisites
- Railway account (https://railway.app) - Sign up with GitHub
- Backend code in GitHub (already done ✓)

### Step 1: Create Railway Project
1. Go to https://railway.app
2. Click "New Project"
3. Select "GitHub Repo"
4. Search for `cforcoder21/vivekanjan.com`
5. Select the repo
6. Railway auto-detects Node.js

### Step 2: Configure Railway
In Railway dashboard:

**Service Name:** vivekanjan-backend

**Environment Variables:**
```
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=production
```

**Important:** JWT_SECRET should be a long random string (at least 32 characters)

### Step 3: Root Directory Configuration
1. Click on the service settings
2. Set **Root Directory** to: `backend`
3. Build command should auto-detect

### Step 4: Database Setup
Railway will:
- Install dependencies from `package.json`
- Run the service with `npm start`
- Use SQLite automatically (stored in Railway filesystem)

**Important Note:** SQLite works but data persists per deployment. For production, you should:
1. Upgrade to Railway PostgreSQL add-on ($15/month)
2. Update connection string in code

### Step 5: Deploy
1. Click "Deploy"
2. Monitor logs in Railway dashboard
3. Once deployment shows "Running", note the public URL

Your backend URL will be: `https://vivekanjan-backend-prod-xxxx.railway.app`

---

## Alternative: Firebase Cloud Run

If you prefer Firebase:

### Step 1: Setup Firebase
```bash
firebase login
firebase init
```

### Step 2: Create Dockerfile
Create `backend/Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --production

COPY . .

EXPOSE 3000

CMD ["npm", "start"]
```

### Step 3: Deploy to Cloud Run
```bash
firebase deploy --only functions
```

---

## Production Database Setup

### Migrate to PostgreSQL (Recommended)

1. **Create PostgreSQL database on Railway**:
   - In Railway, add PostgreSQL plugin
   - Get connection string from Railway dashboard

2. **Update backend code**:
   Change `backend/src/index.js` to use your PostgreSQL connection
   
3. **Run migrations**:
   Use the schema.sql file to initialize database

### Environment Variables on Production
```
DATABASE_URL=postgresql://user:password@host:port/dbname
JWT_SECRET=your-production-secret-key
NODE_ENV=production
PORT=3000
```

---

## Testing Production Backend

After deployment, test these endpoints:

```bash
# Health check
curl https://your-backend-url/health

# Public books endpoint
curl https://your-backend-url/public/books

# OAuth sync (for frontend)
curl -X POST https://your-backend-url/auth/oauth-sync \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "username": "testuser"
  }'
```

---

## Frontend-Backend Connection

After backend deployment:

1. **Update Frontend Environment Variables** in Vercel:
   ```
   VITE_API_BASE_URL = https://your-backend-url
   ```

2. **CORS Configuration**:
   Update `backend/src/index.js`:
   ```javascript
   app.use(cors({
     origin: ['https://vivekanjan.com', 'https://your-vercel-url.vercel.app']
   }))
   ```

3. **Redeploy Frontend** after updating backend URL

---

## Monitoring & Maintenance

### View Logs
- **Railway**: Dashboard → Service logs
- **Firebase**: Cloud Run console → Logs

### Common Issues
- **502 Bad Gateway**: Backend crashed, check logs
- **CORS errors**: Add frontend URL to CORS whitelist
- **Database connection**: Check DATABASE_URL format
- **JWT errors**: Verify JWT_SECRET matches between frontend/backend

### Update Backend
1. Push changes to GitHub
2. Railway auto-redeploys on push
3. No additional deployment steps needed

---

## Security Checklist

- [ ] Change JWT_SECRET to production value
- [ ] Enable HTTPS (both Railway and Vercel)
- [ ] Restrict CORS to your domain only
- [ ] Use environment variables for sensitive data
- [ ] Set up monitoring/alerting
- [ ] Regular backups (if using PostgreSQL)

---

## Estimated Costs

**Railway:**
- Free tier: Enough for development
- Production: $5-20/month depending on usage
- PostgreSQL add-on: $15/month

**Firebase Cloud Run:**
- Free tier: 2M requests/month
- Pay per request after free tier

---

## Next Steps

1. Deploy backend to Railway first
2. Test connections work
3. Deploy frontend to Vercel
4. Connect frontend and backend
5. Test full workflow in production
6. Monitor logs for first week
