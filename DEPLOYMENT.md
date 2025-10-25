# Deployment Configuration Guide

## Backend Deployment (Render.com)
Your backend is deployed at: `https://revision-assistant-platform.onrender.com`

### Backend Environment Variables on Render
Make sure these are configured in your Render dashboard:

```env
NODE_ENV=production
PORT=5000
MONGODB_URI=<your-mongodb-connection-string>
JWT_SECRET=<your-jwt-secret>
JWT_REFRESH_SECRET=<your-jwt-refresh-secret>
FRONTEND_URL=<your-frontend-url-after-deployment>
CORS_ORIGIN=<your-frontend-url-after-deployment>
```

## Frontend Deployment

### Environment Variables
The frontend is now configured to use your deployed backend:

**Production (.env)**:
```env
VITE_API_BASE_URL=https://revision-assistant-platform.onrender.com/api
VITE_SOCKET_URL=https://revision-assistant-platform.onrender.com
VITE_APP_NAME=Revision Assistant
VITE_APP_DESCRIPTION=AI-Powered Learning Platform
```

**Local Development**:
To switch back to local development, update `.env`:
```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Build and Deploy Frontend

#### Option 1: Deploy to Vercel
1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard:
   - `VITE_API_BASE_URL=https://revision-assistant-platform.onrender.com/api`
   - `VITE_SOCKET_URL=https://revision-assistant-platform.onrender.com`
4. Deploy!

#### Option 2: Deploy to Netlify
1. Push your code to GitHub
2. Connect your repository to Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Add environment variables in Netlify dashboard
5. Deploy!

#### Option 3: Deploy to Render (Static Site)
1. Push your code to GitHub
2. Create a new Static Site on Render
3. Connect your repository
4. Build settings:
   - Build command: `cd frontend && npm install && npm run build`
   - Publish directory: `frontend/dist`
5. Add environment variables
6. Deploy!

### CORS Configuration
**IMPORTANT**: After deploying your frontend, update the backend's CORS settings:

1. Go to your Render dashboard for the backend
2. Add/Update these environment variables:
   ```
   FRONTEND_URL=https://your-frontend-url.com
   CORS_ORIGIN=https://your-frontend-url.com
   ```
3. The backend should have this CORS configuration in `server.js`:

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN || process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
```

## Testing the Connection

### Test Backend Health
```bash
curl https://revision-assistant-platform.onrender.com/api/health
```

### Test Frontend Connection
1. Start your frontend: `npm run dev`
2. Open browser console
3. Check if API calls are going to the correct URL
4. Look for CORS errors (if any)

## Common Issues and Solutions

### Issue 1: CORS Errors
**Solution**: Make sure your backend has the correct CORS_ORIGIN set to your frontend URL

### Issue 2: API 404 Errors
**Solution**: Verify the API_BASE_URL includes `/api` at the end

### Issue 3: WebSocket Connection Failed
**Solution**: Make sure VITE_SOCKET_URL doesn't include `/api`

### Issue 4: Authentication Issues
**Solution**: Ensure `withCredentials: true` is set in both API and Socket configurations

## Development vs Production

### Development Mode
```bash
# Backend
cd backend
npm run dev  # Runs on http://localhost:5000

# Frontend
cd frontend
npm run dev  # Runs on http://localhost:3000
```

### Production Mode
- Backend: Deployed on Render (always running)
- Frontend: Build and deploy to Vercel/Netlify/Render

## Build Commands

### Frontend Build
```bash
cd frontend
npm run build  # Creates optimized production build in dist/
```

### Preview Production Build Locally
```bash
cd frontend
npm run build
npm run preview  # Preview the production build locally
```

## Environment Files Priority
1. `.env.local` (highest priority, git-ignored)
2. `.env.production` (for production builds)
3. `.env.development` (for development)
4. `.env` (base configuration)

## Security Checklist
- [ ] JWT secrets are strong and unique
- [ ] MongoDB connection string is secure
- [ ] CORS is properly configured
- [ ] Environment variables are not committed to Git
- [ ] SSL/HTTPS is enabled (Render provides this by default)
- [ ] Rate limiting is enabled on backend
- [ ] API endpoints have proper authentication

## Monitoring
- Monitor your backend on Render dashboard
- Check logs for errors
- Set up health check endpoints
- Monitor API response times

## Scaling
If you need better performance:
1. Upgrade Render plan for backend
2. Enable Redis for caching (add to Render)
3. Use CDN for frontend static assets
4. Optimize database queries with indexes

---

**Current Configuration Status:**
- ✅ Backend deployed: https://revision-assistant-platform.onrender.com
- ✅ Frontend configured to use production backend
- ⏳ Frontend deployment pending
- ⏳ CORS configuration needs frontend URL

**Next Steps:**
1. Test the connection: `npm run dev` in frontend directory
2. Deploy frontend to Vercel/Netlify/Render
3. Update backend CORS_ORIGIN with your frontend URL
4. Test end-to-end functionality
