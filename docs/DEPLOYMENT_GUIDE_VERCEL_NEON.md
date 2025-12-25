# 🚀 Deployment Guide: Vercel + Neon PostgreSQL

Complete guide for deploying TY Project Launchpad to production using Vercel (frontend) and Neon PostgreSQL (database).

---

## 📋 Prerequisites

- [Vercel Account](https://vercel.com) (Free tier works)
- [Neon Account](https://neon.tech) (Free tier: 0.5GB storage, 100 hours compute/month)
- Git repository with your code
- Node.js 18+ installed locally
- Python 3.9+ installed locally

---

## Part 1: Database Setup (Neon PostgreSQL)

### Step 1: Create Neon Project

1. **Sign up/Login to Neon**
   - Go to https://neon.tech
   - Create a new account or sign in

2. **Create New Project**
   - Click "Create Project"
   - Project Name: `ty-project-launchpad` (or your preferred name)
   - Region: Choose closest to your users (e.g., US East, EU West, Asia)
   - Postgres Version: 16 (recommended)
   - Click "Create Project"

3. **Get Connection String**
   - After creation, you'll see the connection string
   - It looks like: `postgresql://username:password@ep-xxx-xxx.region.aws.neon.tech/dbname?sslmode=require`
   - **IMPORTANT:** Copy this connection string - you'll need it!

### Step 2: Configure Database Connection

Neon provides a **pooled connection string** for better performance with serverless:

```
# Regular connection (use for migrations)
postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb

# Pooled connection (use for application)
postgresql://username:password@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
```

**Use the POOLED connection for your application!**

### Step 3: Initialize Database Schema

On your **local machine**:

1. **Install dependencies**
   ```bash
   cd backend_new
   pip install -r requirements.txt
   ```

2. **Create .env file**
   ```bash
   cp .env.example .env
   ```

3. **Edit .env with Neon connection**
   ```bash
   # Use the REGULAR (non-pooled) connection for migrations
   DATABASE_URL=postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require
   
   SECRET_KEY=your-secure-secret-key-here-generate-new-one
   FRONTEND_URL=https://your-app.vercel.app
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=secure-admin-password
   ```

4. **Generate a secure SECRET_KEY**
   ```bash
   python -c "import secrets; print(secrets.token_hex(32))"
   ```

5. **Run migrations to create tables**
   ```bash
   # Initialize Alembic (first time only)
   alembic revision --autogenerate -m "Initial schema with tracking tables"
   
   # Apply migrations
   alembic upgrade head
   ```

6. **Verify tables were created**
   - Go to Neon dashboard → Tables
   - You should see: users, projects, orders, synopsis, meetings, plans, services, user_services, admin_requests, activity_logs, chatbot_history, idea_generation_history

---

## Part 2: Backend Deployment

### Option A: Deploy Backend to Vercel (Recommended for Simple Setup)

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Create vercel.json in backend_new folder**
   ```json
   {
     "version": 2,
     "builds": [
       {
         "src": "run.py",
         "use": "@vercel/python"
       }
     ],
     "routes": [
       {
         "src": "/(.*)",
         "dest": "run.py"
       }
     ],
     "env": {
       "PYTHON_VERSION": "3.9"
     }
   }
   ```

3. **Update run.py for Vercel**
   ```python
   # run.py
   from app.main import app
   
   # Vercel expects the ASGI app to be named 'app'
   # No need to call uvicorn.run() - Vercel handles that
   ```

4. **Deploy to Vercel**
   ```bash
   cd backend_new
   vercel --prod
   ```

5. **Add Environment Variables in Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add these variables:
     ```
     DATABASE_URL=postgresql://...pooler...neon.tech/neondb?sslmode=require
     SECRET_KEY=your-secret-key
     FRONTEND_URL=https://your-frontend.vercel.app
     ADMIN_EMAIL=admin@yourdomain.com
     ADMIN_PASSWORD=secure-password
     ALGORITHM=HS256
     ACCESS_TOKEN_EXPIRE_MINUTES=43200
     MAX_FILE_SIZE=10485760
     ALLOWED_EXTENSIONS=pdf,zip,jpg,png
     ```

   **CRITICAL: Use the POOLED connection string for DATABASE_URL!**

6. **Get your Backend URL**
   - After deployment, Vercel gives you a URL like: `https://your-backend.vercel.app`
   - Test it: `https://your-backend.vercel.app/health`

### Option B: Deploy Backend to Other Platform (Railway, Render, etc.)

If you prefer Railway or Render:

**Railway:**
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login and deploy
railway login
railway init
railway up
```

**Render:**
- Create new Web Service
- Connect GitHub repo
- Build Command: `pip install -r requirements.txt`
- Start Command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`

---

## Part 3: Frontend Deployment (Vercel)

### Step 1: Prepare Frontend

1. **Update environment variables**
   
   Create `.env.production` in `ty-project-launchpad-new-version/`:
   ```bash
   VITE_API_BASE_URL=https://your-backend.vercel.app
   ```

2. **Update vercel.json** (already exists, verify):
   ```json
   {
     "rewrites": [
       {
         "source": "/(.*)",
         "destination": "/index.html"
       }
     ]
   }
   ```

### Step 2: Deploy Frontend

1. **Deploy via Vercel CLI**
   ```bash
   cd ty-project-launchpad-new-version
   vercel --prod
   ```

2. **Or Deploy via Vercel Dashboard**
   - Go to https://vercel.com/new
   - Import your Git repository
   - Framework Preset: Vite
   - Root Directory: `ty-project-launchpad-new-version`
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Add environment variable:
     ```
     VITE_API_BASE_URL=https://your-backend.vercel.app
     ```
   - Click "Deploy"

3. **Get your Frontend URL**
   - Vercel gives you: `https://your-project.vercel.app`
   - Or use custom domain if you have one

### Step 3: Update Backend CORS

Go back to Backend → Vercel → Environment Variables and update:
```
FRONTEND_URL=https://your-project.vercel.app
```

Redeploy backend for changes to take effect.

---

## Part 4: Post-Deployment Setup

### Step 1: Create Admin User

**Method 1: Using the create_admin.py script**
```bash
# Locally, with Neon connection
cd backend_new
python create_admin.py
```

**Method 2: Via API (after deployment)**
```bash
# First signup as regular user
curl -X POST https://your-backend.vercel.app/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@yourdomain.com",
    "password": "SecurePassword123!",
    "name": "Admin User",
    "phone": "1234567890"
  }'

# Then manually update in Neon dashboard:
# Go to Neon → SQL Editor
UPDATE users SET is_admin = true WHERE email = 'admin@yourdomain.com';
```

### Step 2: Seed Initial Data (Plans)

Create a seed script or manually insert plans in Neon SQL Editor:

```sql
-- Insert default plans
INSERT INTO plans (id, name, description, price, features, blog_included, max_projects, support_level)
VALUES 
  (gen_random_uuid()::text, 'Basic', 'Perfect for getting started', 2999, 
   '1 Project,Email Support,Basic Templates,Synopsis Review', false, 1, 'Basic'),
  (gen_random_uuid()::text, 'Standard', 'Most popular choice', 4999,
   '2 Projects,Priority Support,Advanced Templates,Synopsis Review,Code Review', false, 2, 'Standard'),
  (gen_random_uuid()::text, 'Premium', 'Complete solution', 7999,
   '3 Projects,24/7 Support,All Templates,Complete Code,Documentation,Blog Website', true, 3, 'Premium');
```

### Step 3: Test the Application

1. **Test API Health**
   ```bash
   curl https://your-backend.vercel.app/health
   ```

2. **Test Frontend**
   - Visit: https://your-project.vercel.app
   - Sign up as a new user
   - Test login
   - Navigate through pages

3. **Test Admin Panel**
   - Login with admin credentials
   - Visit: https://your-project.vercel.app/admin/dashboard
   - Verify you can see admin features

---

## Part 5: Monitoring & Maintenance

### Database Monitoring (Neon)

1. **Check Database Usage**
   - Neon Dashboard → Project → Metrics
   - Monitor: Storage, Compute hours, Connections

2. **View Activity Logs**
   ```sql
   -- Check recent activity
   SELECT * FROM activity_logs 
   ORDER BY created_at DESC 
   LIMIT 100;
   
   -- Check slow operations
   SELECT action, COUNT(*), AVG(response_time_ms) 
   FROM chatbot_history 
   GROUP BY action;
   ```

3. **Set up Neon Alerts**
   - Configure email notifications for:
     - Storage approaching limit (80%)
     - Compute hours approaching limit
     - Connection errors

### Application Monitoring

1. **Vercel Analytics**
   - Go to Vercel Dashboard → Your Project → Analytics
   - Monitor: Traffic, Performance, Errors

2. **Check Logs**
   ```bash
   # View backend logs
   vercel logs https://your-backend.vercel.app
   
   # View frontend logs
   vercel logs https://your-frontend.vercel.app
   ```

3. **Activity Log Queries** (via Neon SQL Editor)
   ```sql
   -- Most active users
   SELECT user_id, COUNT(*) as actions
   FROM activity_logs
   WHERE created_at > NOW() - INTERVAL '7 days'
   GROUP BY user_id
   ORDER BY actions DESC
   LIMIT 10;
   
   -- Failed actions
   SELECT action, COUNT(*) as failures
   FROM activity_logs
   WHERE status = 'failed'
   AND created_at > NOW() - INTERVAL '24 hours'
   GROUP BY action;
   
   -- Chatbot usage
   SELECT 
     DATE(created_at) as date,
     COUNT(*) as messages,
     COUNT(DISTINCT user_id) as unique_users
   FROM chatbot_history
   GROUP BY DATE(created_at)
   ORDER BY date DESC;
   ```

---

## Part 6: Backup & Recovery

### Database Backups (Neon)

**Neon automatically creates backups:**
- Point-in-time restore available
- Can restore to any point in last 7 days (Free tier)
- 30 days on paid plans

**To create manual backup:**
```bash
# Using pg_dump (local backup)
pg_dump "postgresql://username:password@ep-xxx.region.aws.neon.tech/neondb?sslmode=require" > backup.sql

# Restore from backup
psql "postgresql://..." < backup.sql
```

### File Uploads Backup

Uploaded files are stored locally in `backend_new/uploads/`. For production:

**Option 1: Use Vercel Blob Storage**
```bash
npm install @vercel/blob
```

**Option 2: Use AWS S3 or Cloudinary**
- Store files externally
- Only store URLs in database

---

## Part 7: Database Migrations

### When you make schema changes:

1. **Update models locally** (e.g., add new column to Project model)

2. **Create migration**
   ```bash
   cd backend_new
   alembic revision --autogenerate -m "Add new field to projects"
   ```

3. **Test migration locally**
   ```bash
   alembic upgrade head
   ```

4. **Deploy changes**
   ```bash
   # Commit changes
   git add .
   git commit -m "Add new field to projects"
   git push
   
   # Vercel auto-deploys from Git
   # Or manually: vercel --prod
   ```

5. **Run migration on production**
   ```bash
   # Use Neon connection string
   DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require" alembic upgrade head
   ```

### Rollback if needed:
```bash
alembic downgrade -1  # Rollback one migration
alembic downgrade <revision>  # Rollback to specific version
```

---

## Part 8: Performance Optimization

### Neon-Specific Optimizations

1. **Use Connection Pooling**
   - Always use the `*-pooler.region.aws.neon.tech` endpoint
   - Keep pool_size conservative (5-10)

2. **Enable Autoscaling**
   - Neon automatically scales compute
   - No configuration needed on free tier

3. **Monitor Query Performance**
   - Check slow query logs in application logs
   - Optimize queries that take >500ms

### Vercel-Specific Optimizations

1. **Enable Edge Caching**
   ```typescript
   // In API routes that can be cached
   export const config = {
     runtime: 'edge',
   }
   ```

2. **Use Environment Variables for Secrets**
   - Never commit secrets to Git
   - Use Vercel environment variables

---

## 🔐 Security Checklist

Before going live:

- [ ] Change all default passwords
- [ ] Use strong SECRET_KEY (generated with `secrets.token_hex(32)`)
- [ ] Enable HTTPS only (Vercel does this automatically)
- [ ] Restrict CORS to your frontend domain only
- [ ] Review Neon IP allowlist if needed
- [ ] Set up rate limiting (future enhancement)
- [ ] Regular security updates: `pip install -U -r requirements.txt`
- [ ] Monitor activity logs for suspicious activity
- [ ] Enable 2FA on Vercel and Neon accounts

---

## 💰 Cost Estimate

### Free Tier Limits

**Neon PostgreSQL (Free):**
- 0.5 GB storage
- 100 compute hours/month
- 1 project
- 7-day point-in-time restore

**Vercel (Free/Hobby):**
- 100 GB bandwidth/month
- Unlimited deployments
- 100 GB-Hours serverless function execution
- Automatic HTTPS

### When to Upgrade

**Upgrade Neon if:**
- Storage > 0.5 GB ($20/month for 10 GB)
- Need > 100 compute hours ($19/month for Launch plan)
- Need longer backup retention

**Upgrade Vercel if:**
- Bandwidth > 100 GB ($20/month for Pro)
- Need custom domains (included in Pro)
- Need team collaboration

**Estimated Monthly Cost (100 active users):**
- Neon: $0-20
- Vercel: $0-20
- **Total: $0-40/month**

---

## 🆘 Troubleshooting

### Common Issues

**1. "Connection to database failed"**
```bash
# Check connection string format
# Must include ?sslmode=require for Neon
postgresql://user:pass@host/db?sslmode=require

# Test connection
psql "postgresql://..." -c "SELECT 1"
```

**2. "Slow API responses"**
```bash
# Check if using pooled connection
# Should have "-pooler" in the hostname
-pooler.region.aws.neon.tech

# Check slow query logs
vercel logs --follow
```

**3. "CORS error in browser"**
```bash
# Verify FRONTEND_URL matches exactly
# In backend .env:
FRONTEND_URL=https://your-app.vercel.app

# Redeploy after changing
vercel --prod
```

**4. "File uploads not working"**
- Vercel serverless functions have 4.5 MB limit
- For larger files, use Vercel Blob or S3
- Or increase MAX_FILE_SIZE and deploy to different platform

**5. "Migrations fail on production"**
```bash
# Run migrations with production DATABASE_URL
export DATABASE_URL="postgresql://...neon.tech/..."
alembic upgrade head

# Check current version
alembic current
```

---

## 📚 Additional Resources

- [Neon Documentation](https://neon.tech/docs)
- [Vercel Documentation](https://vercel.com/docs)
- [FastAPI Deployment](https://fastapi.tiangolo.com/deployment/)
- [Alembic Tutorial](https://alembic.sqlalchemy.org/en/latest/tutorial.html)

---

## 🎉 You're Live!

Your application is now deployed and running on:
- **Frontend:** https://your-project.vercel.app
- **Backend API:** https://your-backend.vercel.app
- **Database:** Neon PostgreSQL (managed)

**Next steps:**
1. Share the URL with users
2. Monitor logs and metrics
3. Collect feedback
4. Iterate and improve!

---

**Questions or issues?** Check the troubleshooting section or review application logs.
