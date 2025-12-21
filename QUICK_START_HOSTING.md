# ⚡ Quick Start: Deploy to Vercel + Neon

**5-minute setup guide for hosting TY Project Launchpad**

---

## 🎯 Prerequisites
- GitHub account with your code
- 5 minutes of your time

---

## Step 1: Database (Neon) - 2 minutes

1. **Go to https://neon.tech** → Sign up (free)
2. **Create Project** → Name: `ty-launchpad`
3. **Copy connection string** (looks like):
   ```
   postgresql://user:pass@ep-xxx-pooler.region.aws.neon.tech/neondb?sslmode=require
   ```
   ⚠️ **Make sure it has `-pooler` in the URL!**

---

## Step 2: Backend (Vercel) - 2 minutes

1. **Go to https://vercel.com** → Sign up/Login
2. **Import Git Repository** → Choose your repo
3. **Root Directory:** `backend_new`
4. **Add Environment Variables:**
   ```
   DATABASE_URL=postgresql://...pooler...neon.tech/neondb?sslmode=require
   SECRET_KEY=<run: python -c "import secrets; print(secrets.token_hex(32))">
   FRONTEND_URL=https://your-app.vercel.app
   ADMIN_EMAIL=admin@yourdomain.com
   ADMIN_PASSWORD=YourSecurePassword123!
   ```
5. **Deploy** 🚀

---

## Step 3: Frontend (Vercel) - 1 minute

1. **Import Repository Again**
2. **Root Directory:** `ty-project-launchpad-new-version`
3. **Add Environment Variable:**
   ```
   VITE_API_BASE_URL=https://your-backend.vercel.app
   ```
4. **Deploy** 🚀

---

## Step 4: Initialize Database - 1 minute

**On your local machine:**

```bash
# 1. Set DATABASE_URL
export DATABASE_URL="postgresql://...neon.tech/neondb?sslmode=require"

# 2. Create migration
cd backend_new
alembic revision --autogenerate -m "Initial schema"

# 3. Apply to Neon
alembic upgrade head
```

**Or run directly on production:**
```bash
DATABASE_URL="your-neon-url" alembic upgrade head
```

---

## Step 5: Create Admin User

**Option A: SQL in Neon Dashboard**
```sql
-- First, signup via your app, then run:
UPDATE users SET is_admin = true 
WHERE email = 'admin@yourdomain.com';
```

**Option B: Use create_admin.py**
```bash
cd backend_new
python create_admin.py
```

---

## ✅ You're Live!

**Test your deployment:**
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-backend.vercel.app/health`
- Admin: `https://your-app.vercel.app/admin/login`

---

## 🔍 Quick Checks

### ✅ Backend is working:
```bash
curl https://your-backend.vercel.app/health
# Should return: {"status":"healthy"}
```

### ✅ Database is connected:
Check Neon dashboard → Tables → Should see 12 tables

### ✅ Frontend loads:
Visit your Vercel URL → Should see landing page

---

## 💡 Common Issues

**"Connection failed"**
- Check DATABASE_URL has `?sslmode=require`
- Verify using `-pooler` URL (not regular)

**"CORS error"**
- Update FRONTEND_URL in backend env vars
- Redeploy backend

**"Tables not found"**
- Run migrations: `alembic upgrade head`

---

## 📚 Full Documentation

- **Complete Guide:** `DEPLOYMENT_GUIDE_VERCEL_NEON.md`
- **Database Commands:** `MIGRATION_COMMANDS.md`
- **Implementation Details:** `DATABASE_IMPROVEMENTS_SUMMARY.md`

---

## 🆘 Need Help?

1. Check `DEPLOYMENT_GUIDE_VERCEL_NEON.md` → Troubleshooting section
2. View Vercel logs: `vercel logs --follow`
3. Check Neon metrics in dashboard

---

**That's it! 🎉 Your app is now live on the internet!**
