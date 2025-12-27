# 🚀 Deployment Environment Setup Guide

## Frontend (Vercel) - https://final-tyforge.vercel.app

### Environment Variables to Set in Vercel:

```
VITE_API_BASE_URL=https://final-tyforge-1d55.onrender.com
```

**How to Add:**
1. Go to Vercel Dashboard → Your Project
2. Settings → Environment Variables
3. Add `VITE_API_BASE_URL` with value above
4. Apply to: **Production, Preview, Development**
5. Redeploy

---

## Backend (Render) - https://final-tyforge-1d55.onrender.com

### Environment Variables to Set in Render:

```bash
# Database
DATABASE_URL=postgresql://neondb_owner:npg_TvIrSHu7FO3g@ep-delicate-cloud-a5fxcbp7.us-east-2.aws.neon.tech/tyforge?sslmode=require

# Security
SECRET_KEY=<GENERATE_NEW_KEY>
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=43200

# CORS
FRONTEND_URL=https://final-tyforge.vercel.app

# File Upload
MAX_FILE_SIZE=10485760
ALLOWED_EXTENSIONS=pdf,zip,jpg,jpeg,png

# AI APIs
XAI_API_KEY=<YOUR_XAI_API_KEY>
XAI_MODEL=grok-4-1-fast-non-reasoning
GROQ_API_KEY=<YOUR_GROQ_API_KEY>
GROQ_MODEL=llama-3.3-70b-versatile

# Admin
ADMIN_EMAIL=pravinpatil90939@gmail.com
ADMIN_PASSWORD=whitedevil16

# Schema
AUTO_CREATE_TABLES=false
```

**⚠️ IMPORTANT: Generate New SECRET_KEY**
Run this command locally and use the output:
```bash
python -c "import secrets; print(secrets.token_hex(32))"
```

**How to Add:**
1. Go to Render Dashboard → Your Service
2. Environment → Environment Variables
3. Add all variables above
4. Click "Save Changes" (will auto-redeploy)

---

## Custom Domain Setup (tyforge.in)

### Vercel:
1. Go to Project Settings → Domains
2. Add `tyforge.in` and `www.tyforge.in`
3. Update DNS records at your domain provider:
   - Type: `A`, Name: `@`, Value: `76.76.21.21`
   - Type: `CNAME`, Name: `www`, Value: `cname.vercel-dns.com`

### Update CORS After Domain Setup:
Add to Render environment:
```
FRONTEND_URL=https://tyforge.in
```

---

## Verification Checklist:

### Frontend:
- [ ] `VITE_API_BASE_URL` points to Render backend
- [ ] Build succeeds on Vercel
- [ ] Can access site at https://final-tyforge.vercel.app

### Backend:
- [ ] All environment variables set in Render
- [ ] Database connection works (Neon)
- [ ] Health check works: `https://final-tyforge-1d55.onrender.com/health`
- [ ] API docs accessible: `https://final-tyforge-1d55.onrender.com/docs`

### CORS:
- [ ] Frontend can call backend APIs
- [ ] Login works from production frontend
- [ ] No CORS errors in browser console

### Features:
- [ ] Admin login works
- [ ] Idea generation works (Groq/Grok)
- [ ] Chatbot works
- [ ] Synopsis upload works
- [ ] File uploads work

---

## Troubleshooting:

**CORS Errors:**
- Check `FRONTEND_URL` in Render matches your Vercel URL
- Backend auto-allows `*.vercel.app` domains

**API Connection Failed:**
- Verify `VITE_API_BASE_URL` in Vercel (no trailing slash)
- Check Render service is running

**Database Errors:**
- Verify `DATABASE_URL` is correct
- Check Neon database is active

**File Upload Errors:**
- Render has ephemeral storage - files lost on restart
- Consider using AWS S3 or Cloudinary for production

---

## Files Reference:

- See this guide for all required environment variables
- Set them directly in Vercel/Render dashboards (don't commit .env.production files with secrets)
