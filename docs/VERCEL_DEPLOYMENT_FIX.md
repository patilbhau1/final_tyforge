# 🚀 Vercel Deployment Fix Guide

## ❌ Current Issue
Vercel is looking for: `ty-project-launchpad-new-version/ty-project-launchpad-new-version` (duplicate path)
This is because the Root Directory setting is incorrect in your Vercel project.

---

## ✅ Solution 1: Fix Root Directory in Vercel Dashboard (RECOMMENDED)

### Steps:
1. **Go to Vercel Project Settings:**
   👉 https://vercel.com/pravins-projects-d3dd6c80/tyforge11/settings

2. **Find "Root Directory" section** (usually under "General" or "Build & Development Settings")

3. **Current (Wrong) Setting:**
   ```
   Root Directory: ty-project-launchpad-new-version
   ```

4. **Change to (Correct):**
   ```
   Root Directory: ./ 
   ```
   OR leave it completely **blank** (empty)

5. **Click "Save"**

6. **Then deploy from your terminal:**
   ```bash
   cd ty-project-launchpad-new-version
   vercel --prod
   ```

---

## ✅ Solution 2: Deploy via Git Push (EASIER)

If you have your Vercel project connected to Git:

### Steps:
1. **Commit the changes:**
   ```bash
   cd ty-project-launchpad-new-version
   git add .
   git commit -m "Fix: Update production API URL to https://final-tyforge.onrender.com"
   git push origin main
   ```

2. **Vercel will automatically detect and deploy** (if Git integration is set up)

3. **Check deployment status:**
   👉 https://vercel.com/pravins-projects-d3dd6c80/tyforge11

---

## ✅ Solution 3: Delete and Recreate Vercel Link

If above solutions don't work:

### Steps:
1. **Remove existing Vercel link:**
   ```bash
   cd ty-project-launchpad-new-version
   rm -rf .vercel
   ```

2. **Re-link and deploy:**
   ```bash
   vercel --prod
   ```

3. **When prompted:**
   - Link to existing project: **YES**
   - Select project: **tyforge11**
   - Root directory: **Leave blank or type `.`**

---

## ⚙️ Vercel Environment Variables Check

Make sure these are set in Vercel dashboard:

| Variable | Value | Environment |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | `https://final-tyforge.onrender.com` | Production, Preview |

**To verify:**
```bash
vercel env ls
```

---

## 🧪 After Deployment

Once deployed successfully:

1. **Visit your site:** https://tyforge.in

2. **Open Browser DevTools** (F12)

3. **Check Console** for any errors

4. **Try logging in** - should work without CORS errors!

5. **Verify API calls** in Network tab:
   - Should call: `https://final-tyforge.onrender.com`
   - Should return: `Access-Control-Allow-Origin: https://tyforge.in`

---

## 🆘 Still Having Issues?

### Check 1: Verify Root Directory Setting
Go to: https://vercel.com/pravins-projects-d3dd6c80/tyforge11/settings
- Root Directory should be empty or `./`

### Check 2: Verify Build Settings
- Framework Preset: **Vite**
- Build Command: `npm run build` or `vite build`
- Output Directory: `dist`
- Install Command: `npm install`

### Check 3: Check Deployment Logs
Go to: https://vercel.com/pravins-projects-d3dd6c80/tyforge11
- Click on latest deployment
- Check build logs for errors

---

## 📝 Summary

**What we fixed:**
- ✅ Updated `.env` to use production API URL
- ✅ Set Vercel environment variable `VITE_API_BASE_URL`
- ⏳ Need to deploy frontend with new settings

**What you need to do:**
1. Fix Root Directory in Vercel dashboard (Solution 1)
2. OR use Git push to deploy (Solution 2)
3. OR re-link Vercel project (Solution 3)

**After deployment:**
- Backend will accept requests from https://tyforge.in
- Frontend will call https://final-tyforge.onrender.com
- CORS errors should be completely resolved! 🎉
