# 🔧 CORS Fix - Deployment Steps

## ✅ Changes Made

### 1. Backend Configuration Updated
- **File:** `backend_new/.env.render`
- **Change:** Updated `FRONTEND_URL` from `http://localhost:8080` to `https://tyforge.in`

### 2. Frontend Configuration Updated  
- **File:** `ty-project-launchpad-new-version/.env`
- **Change:** Updated `VITE_API_BASE_URL` from `http://localhost:8000` to `https://final-tyforge.onrender.com`

### 3. Backend CORS Middleware Enhanced
- **File:** `backend_new/app/main.py`
- **Change:** Added both HTTP and HTTPS variants for tyforge.in domain

---

## 🚀 Deployment Steps

### Step 1: Update Render Backend Environment Variables

1. Go to **Render Dashboard** → Your backend service
2. Navigate to **Environment** tab
3. Update the `FRONTEND_URL` variable:
   ```
   FRONTEND_URL=https://tyforge.in
   ```
4. Click **Save Changes**
5. Render will automatically redeploy your backend

**⏱️ Wait for deployment to complete** (usually 2-5 minutes)

### Step 2: Redeploy Frontend to Vercel/Your Host

Since you're using `tyforge.in`, you need to rebuild and deploy the frontend with the new API URL.

**If using Vercel:**
```bash
cd ty-project-launchpad-new-version
vercel --prod
```

**Or if using Git-based deployment:**
```bash
git add .
git commit -m "Fix: Update production API URL for CORS"
git push origin main
```

**⚠️ Important:** Make sure to set environment variable in Vercel/hosting platform:
```
VITE_API_BASE_URL=https://final-tyforge.onrender.com
```

### Step 3: Clear Browser Cache

After both deployments are complete:
1. Open your browser
2. Press `Ctrl+Shift+Delete` (or `Cmd+Shift+Delete` on Mac)
3. Clear **Cached images and files**
4. Or use **Incognito/Private mode** to test

---

## 🧪 Testing the Fix

### 1. Check Backend CORS Headers

Open your browser console and run:
```javascript
fetch('https://final-tyforge.onrender.com/health', {
  method: 'GET',
  headers: { 'Origin': 'https://tyforge.in' }
})
.then(r => r.json())
.then(console.log)
```

**Expected response:** `{status: "healthy"}`

### 2. Check Network Tab

1. Open **DevTools** (F12)
2. Go to **Network** tab
3. Try logging in or making any API call
4. Check the response headers - you should see:
   ```
   Access-Control-Allow-Origin: https://tyforge.in
   Access-Control-Allow-Credentials: true
   ```

### 3. Test Login Flow

1. Go to `https://tyforge.in`
2. Try to login
3. Check for any CORS errors in console
4. Should work without issues!

---

## 🔍 Troubleshooting

### Issue: Still seeing CORS errors after deployment

**Solution 1: Verify Environment Variables**
```bash
# On Render dashboard, check that FRONTEND_URL is exactly:
FRONTEND_URL=https://tyforge.in

# No trailing slash, must be HTTPS
```

**Solution 2: Check Backend Logs**
1. Go to Render → Your service → Logs
2. Look for: `🔒 CORS allowed origins: ...`
3. Verify `https://tyforge.in` is in the list

**Solution 3: Hard Refresh Frontend**
- Press `Ctrl+F5` or `Cmd+Shift+R`
- This forces browser to reload all assets

### Issue: OPTIONS preflight requests failing

Check the backend logs for the CustomCORSMiddleware handling OPTIONS requests. The middleware should return 200 for preflight requests.

### Issue: Mixed content (HTTP/HTTPS)

If your domain uses HTTPS, ensure all API calls use HTTPS:
- Frontend should call: `https://final-tyforge.onrender.com` ✅
- Not: `http://final-tyforge.onrender.com` ❌

---

## 📋 Quick Checklist

Before going live:

- [ ] Backend `FRONTEND_URL` set to `https://tyforge.in` in Render
- [ ] Frontend `VITE_API_BASE_URL` set to `https://final-tyforge.onrender.com`
- [ ] Backend redeployed on Render
- [ ] Frontend redeployed with new environment variables
- [ ] Browser cache cleared
- [ ] Test login/signup working
- [ ] Check Network tab shows correct CORS headers
- [ ] No console errors related to CORS

---

## 🎯 Summary

The CORS issue was caused by:
1. ❌ Backend expecting requests from `http://localhost:8080`
2. ❌ Frontend trying to call `http://localhost:8000`
3. ❌ Environment variables not updated for production

**Fixed by:**
1. ✅ Updated backend to allow `https://tyforge.in`
2. ✅ Updated frontend to call `https://final-tyforge.onrender.com`
3. ✅ Enhanced CORS middleware to handle both HTTP and HTTPS variants

---

## 🆘 Still Having Issues?

If CORS errors persist after following all steps:

1. Share the **exact error message** from browser console
2. Share **Network tab screenshot** showing the failed request
3. Share **Backend logs** from Render dashboard

Common error patterns:
```
Access to fetch at 'https://final-tyforge.onrender.com/api/auth/login' 
from origin 'https://tyforge.in' has been blocked by CORS policy
```

This would indicate the backend isn't receiving the updated environment variable.
