# 🚀 Quick Start Guide

## ⚡ Super Fast Setup (2 Steps!)

### Step 1: Update Backend CORS (⚠️ REQUIRED)

Go to your Render dashboard and add this environment variable:

**URL**: https://dashboard.render.com/web/srv-YOUR-SERVICE-ID

**Variable to Add:**
```
Name: FRONTEND_URLS
Value: https://revision-assistant-platform.vercel.app,https://revision-assistant-platform-git-main-mutangana-benonis-projects.vercel.app,https://revision-assistant-platform-nrcqj3h6f.vercel.app,http://localhost:3000
```

Click "Save Changes" and wait 2-3 minutes.

### Step 2: Test Your App

Open: **https://revision-assistant-platform.vercel.app**

That's it! 🎉

---

## 🧪 Quick Test

Open browser console on your Vercel app and run:

```javascript
fetch('https://revision-assistant-platform.onrender.com/api/health', {credentials: 'include'})
  .then(r => r.json())
  .then(d => console.log('✅', d))
  .catch(e => console.error('❌', e));
```

**Expected Result:** You should see `✅` with health data

**If you see Error:** Wait 2 more minutes for Render to finish redeploying

---

## 📱 Your Live URLs

**Frontend**: https://revision-assistant-platform.vercel.app
**Backend**: https://revision-assistant-platform.onrender.com

---

## ❓ Having Issues?

### CORS Error?
1. Double-check `FRONTEND_URLS` on Render
2. Wait 3 minutes for redeploy
3. Clear browser cache (Ctrl+Shift+Delete)
4. Try again

### Backend Slow?
- First load takes 30-60 seconds (Render free tier wakes up)
- Subsequent requests are fast
- Consider upgrading to paid tier

### Still Not Working?
Check these files for detailed help:
- `FINAL_DEPLOYMENT_SUMMARY.md` - Complete guide
- `VERCEL_DEPLOYMENT.md` - Vercel-specific info
- `RENDER_ENV_SETUP.txt` - All backend env vars

---

**You're all set! Enjoy your deployed app! 🚀**
