# 🔌 Ngrok Backend Setup Guide

## 🎯 Current Configuration

You're using **ngrok** to expose your local backend to the internet for production use.

**Current Setup:**
- Frontend: `https://tyforge.in` (Vercel)
- Backend: `https://05401f824dee.ngrok-free.app` (ngrok → localhost:8000)
- Backend Local: `http://localhost:8000`

---

## ⚠️ Important Notes About Ngrok

### Free Tier Limitations:
1. **URL Changes:** Ngrok free tier generates a new URL each time you restart
2. **Session Timeout:** Sessions expire after 2 hours (need to restart)
3. **Connection Limits:** Limited concurrent connections
4. **No Custom Domain:** Can't use custom domain on free tier

---

## 🚀 Step-by-Step Setup

### 1. Start Your Backend Locally

```bash
cd backend_new
python run.py
```

**Expected output:**
```
INFO:     Uvicorn running on http://0.0.0.0:8000
🔒 CORS allowed origins: ['https://tyforge.in', 'https://www.tyforge.in', ...]
```

---

### 2. Start Ngrok Tunnel

**In a new terminal:**
```bash
ngrok http 8000
```

**You'll see output like:**
```
Session Status    online
Forwarding        https://05401f824dee.ngrok-free.app -> http://localhost:8000
```

**Copy the ngrok URL!** (e.g., `https://05401f824dee.ngrok-free.app`)

---

### 3. Update Configuration if Ngrok URL Changed

**If ngrok gave you a NEW URL (different from `05401f824dee.ngrok-free.app`):**

#### A. Update Frontend Environment Variable

**Option 1 - Via Vercel Dashboard (Recommended):**
1. Go to: https://vercel.com/pravins-projects-d3dd6c80/tyforge11/settings/environment-variables
2. Find: `VITE_API_BASE_URL`
3. Update to: Your new ngrok URL
4. Redeploy: Go to Deployments → Latest → Redeploy

**Option 2 - Via CLI:**
```bash
cd ty-project-launchpad-new-version
vercel env rm VITE_API_BASE_URL production
echo "YOUR_NEW_NGROK_URL" | vercel env add VITE_API_BASE_URL production
git commit --allow-empty -m "Trigger redeploy"
git push origin master
```

#### B. Update Backend CORS (Local)

Edit `backend_new/app/main.py`:
```python
production_domains = [
    "https://tyforge.in",
    "https://www.tyforge.in",
    "http://tyforge.in",
    "http://www.tyforge.in",
    # Ngrok URLs (UPDATE THIS!)
    "https://YOUR_NEW_NGROK_URL.ngrok-free.app",
]
```

**Restart your backend:**
```bash
# Stop the running backend (Ctrl+C)
python run.py
```

---

## 🧪 Testing Your Setup

### 1. Test Backend via Ngrok

```bash
# Test health endpoint
curl https://05401f824dee.ngrok-free.app/health

# Expected: {"status":"healthy"}
```

**Browser test:**
Open: https://05401f824dee.ngrok-free.app/health

---

### 2. Test CORS

```bash
# Test CORS from your domain
curl -H "Origin: https://tyforge.in" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://05401f824dee.ngrok-free.app/api/plans

# Should return 200 with CORS headers
```

---

### 3. Test Frontend

1. Visit: **https://tyforge.in**
2. Clear cache: `Ctrl+Shift+Delete`
3. Open DevTools: `F12` → Console
4. Check for errors
5. Try logging in
6. Try selecting a plan

---

## 🔧 Troubleshooting

### Issue: "Ngrok Session Expired"

**Symptom:** Backend stops responding after 2 hours

**Solution:**
1. Restart ngrok: `ngrok http 8000`
2. Copy new URL
3. Update Vercel env variable
4. Redeploy frontend

---

### Issue: "Ngrok URL Changed"

**Symptom:** Frontend can't connect to backend after restart

**Solution:** Follow "Step 3: Update Configuration" above

---

### Issue: CORS Errors Still Appearing

**Check 1: Backend has correct CORS origins**
```bash
# Check backend logs when it starts
# Should show: 🔒 CORS allowed origins: ['https://tyforge.in', ...]
```

**Check 2: Ngrok URL matches**
```bash
# Check frontend is calling correct URL
# Open DevTools → Network tab → Look at API calls
# Should call: https://YOUR_NGROK_URL.ngrok-free.app
```

---

### Issue: Plans Not Showing

**Check if backend has data:**
```bash
curl https://05401f824dee.ngrok-free.app/api/plans
```

**If empty response `[]`:**
```bash
cd backend_new
python update_plans.py
```

---

### Issue: Chatbot Not Working

**Current Status:** Chatbot uses intelligent fallback responses (no AI)

**Why:** Backend doesn't have `/api/chatbot/chat` endpoint yet

**Solution:** Chatbot will respond with pre-programmed helpful messages

**To enable AI chatbot:**
1. Backend needs to implement `/api/chatbot/chat` endpoint
2. Or use the existing `/api/idea-generation/generate` endpoint

---

## 🔒 Security Considerations

### Ngrok Free Tier Security:

1. **Exposed Endpoints:** Your entire backend is public
2. **No Rate Limiting:** No built-in protection
3. **Logs Visible:** Ngrok dashboard shows all requests
4. **SSL:** Ngrok provides HTTPS automatically ✅

### Recommendations:

1. **Use Authentication:** All sensitive endpoints require JWT tokens ✅
2. **Rate Limiting:** Consider adding rate limiting middleware
3. **Monitor Logs:** Check ngrok dashboard regularly
4. **Don't Expose Secrets:** Never log API keys or passwords

---

## 💡 Better Alternatives for Production

### 1. Render.com (Free Tier)
**Pros:**
- Persistent URL (doesn't change)
- No session timeout
- Auto-restart on crashes
- Better for production

**Cons:**
- Sleeps after 15 min inactivity
- Slow cold start (30-60s)

**Setup:** See `DEPLOYMENT_GUIDE_VERCEL_NEON.md`

---

### 2. Railway.app
**Pros:**
- Generous free tier
- Fast deployment
- Better than Render free tier

**Cons:**
- Requires credit card (but free)

---

### 3. Heroku
**Pros:**
- Reliable
- Good documentation
- Popular choice

**Cons:**
- No longer has free tier

---

## 📊 Current Status Checklist

- [x] Backend running locally on port 8000
- [x] Ngrok tunnel active
- [x] Frontend configured with ngrok URL
- [x] CORS configured for tyforge.in
- [x] Code pushed to GitHub
- [ ] Vercel redeployed with new env
- [ ] Backend has plans data
- [ ] All endpoints tested

---

## 🔄 Daily Workflow (with Ngrok)

### Morning Setup:
```bash
# Terminal 1: Start backend
cd backend_new
python run.py

# Terminal 2: Start ngrok
ngrok http 8000

# Copy ngrok URL → Update Vercel if URL changed → Test site
```

### During Development:
- Backend stays running (restart only when code changes)
- Ngrok stays running (restart every 2 hours on free tier)
- Frontend auto-deploys on git push

### End of Day:
- Keep backend running if you want 24/7 availability
- Or stop everything (site will be down)

---

## 🎯 Current Configuration Files

### Frontend (.env)
```
VITE_API_BASE_URL=https://05401f824dee.ngrok-free.app
```

### Backend (main.py)
```python
production_domains = [
    "https://tyforge.in",
    "https://www.tyforge.in",
    "https://05401f824dee.ngrok-free.app",  # Ngrok URL
]
```

---

## ✅ Success Indicators

Your setup is working when:

1. ✅ Backend responds at ngrok URL
2. ✅ Frontend loads at tyforge.in
3. ✅ No CORS errors in browser console
4. ✅ Login works
5. ✅ Plans load correctly
6. ✅ Chatbot responds (with fallback messages)

---

## 🆘 Need Help?

If issues persist:
1. Check ngrok is running: Visit ngrok URL in browser
2. Check backend logs: Look for errors in terminal
3. Check Vercel logs: Vercel dashboard → Deployments → Logs
4. Check browser console: F12 → Console tab

**Share these for debugging:**
- Ngrok URL
- Browser console errors
- Backend terminal logs
- Network tab screenshot (F12 → Network)
