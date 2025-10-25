# 🚀 Backend CORS Configuration for Vercel Frontend

## Your Vercel Deployment URLs
You have 3 Vercel URLs for your frontend:
1. **Primary**: `https://revision-assistant-platform.vercel.app`
2. **Branch**: `https://revision-assistant-platform-git-main-mutangana-benonis-projects.vercel.app`
3. **Preview**: `https://revision-assistant-platform-nrcqj3h6f.vercel.app`

## ⚙️ Update Backend Environment Variables on Render

Go to your Render dashboard for the backend and add/update these environment variables:

### Option 1: Multiple URLs (Recommended)
```
FRONTEND_URLS=https://revision-assistant-platform.vercel.app,https://revision-assistant-platform-git-main-mutangana-benonis-projects.vercel.app,https://revision-assistant-platform-nrcqj3h6f.vercel.app,http://localhost:3000
```

### Option 2: Single URL (Simpler)
```
FRONTEND_URL=https://revision-assistant-platform.vercel.app
```

## 📝 Steps to Update on Render:

1. **Login to Render**: https://dashboard.render.com
2. **Select your backend service**: revision-assistant-platform
3. **Go to Environment tab**
4. **Add/Update these variables**:
   - Key: `FRONTEND_URLS`
   - Value: `https://revision-assistant-platform.vercel.app,https://revision-assistant-platform-git-main-mutangana-benonis-projects.vercel.app,https://revision-assistant-platform-nrcqj3h6f.vercel.app,http://localhost:3000`
5. **Save changes** - This will trigger a redeploy

## ✅ Verification

After updating, test your connection:

### Test 1: Backend Health Check
```bash
curl https://revision-assistant-platform.onrender.com/api/health
```

### Test 2: CORS from Vercel URL
Open your browser console at `https://revision-assistant-platform.vercel.app` and run:
```javascript
fetch('https://revision-assistant-platform.onrender.com/api/health', {
  credentials: 'include'
})
.then(r => r.json())
.then(d => console.log('✅ Connection successful:', d))
.catch(e => console.error('❌ Connection failed:', e));
```

## 🔧 Current Backend CORS Configuration

Your backend already supports multiple origins via the `FRONTEND_URLS` environment variable. The code in `server.js` splits comma-separated URLs:

```javascript
const allowedOrigins = (process.env.FRONTEND_URLS || process.env.FRONTEND_URL || 'http://localhost:3000')
  .split(',')
  .map(origin => origin.trim());
```

## 🌐 All Your URLs

### Frontend (Vercel)
- Primary: https://revision-assistant-platform.vercel.app
- Branch: https://revision-assistant-platform-git-main-mutangana-benonis-projects.vercel.app  
- Preview: https://revision-assistant-platform-nrcqj3h6f.vercel.app

### Backend (Render)
- API: https://revision-assistant-platform.onrender.com

## 🔐 Additional Backend Variables to Check

Make sure these are also set on Render:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=30d
FRONTEND_URLS=https://revision-assistant-platform.vercel.app,https://revision-assistant-platform-git-main-mutangana-benonis-projects.vercel.app,https://revision-assistant-platform-nrcqj3h6f.vercel.app,http://localhost:3000
```

## 📱 Test Your App

1. **Open your Vercel app**: https://revision-assistant-platform.vercel.app
2. **Try to register/login**
3. **Check browser console** for:
   - ✅ No CORS errors
   - ✅ API calls going to Render backend
   - ✅ Successful responses

## ❗ Common Issues

### Issue: CORS Error
**Symptom**: "Access to fetch at '...' from origin '...' has been blocked by CORS policy"
**Solution**: 
- Verify `FRONTEND_URLS` is set correctly on Render
- Wait 2-3 minutes for Render to redeploy after changing env vars
- Clear browser cache and reload

### Issue: 404 Not Found
**Symptom**: API returns 404
**Solution**: 
- Check API URL includes `/api` path
- Verify backend is running on Render

### Issue: Slow Response
**Symptom**: First request takes 30+ seconds
**Solution**: 
- Render free tier spins down after inactivity
- First request wakes it up (takes ~30-60 seconds)
- Consider upgrading to paid tier for always-on service

## 🎯 Quick Action Items

- [ ] Add `FRONTEND_URLS` to Render environment variables
- [ ] Save and wait for redeploy (~2-3 minutes)
- [ ] Test connection from Vercel app
- [ ] Check browser console for errors
- [ ] Try registering a new user
- [ ] Test all main features (dashboard, quizzes, resources)

## 📞 Support

If you encounter issues:
1. Check Render logs for backend errors
2. Check Vercel deployment logs
3. Check browser console for frontend errors
4. Verify all environment variables are set correctly
