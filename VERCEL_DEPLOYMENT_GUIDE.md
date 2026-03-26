# 🚀 VERCEL FRONTEND DEPLOYMENT GUIDE - EchoAid

## 📋 PRE-DEPLOYMENT CHECKLIST

### ✅ Required Environment Variables for Vercel:
```
VITE_API_BASE_URL=https://your-railway-backend.railway.app
VITE_PY_SERVICE_URL=
VITE_LOG_LEVEL=info
VITE_ENABLE_PRETTY_LOGS=true
VITE_APP_VERSION=1.0.0
```

## 🚀 DEPLOYMENT STEPS

### Step 1: Create Vercel Account
1. Go to [vercel.com](https://vercel.com)
2. Sign up with GitHub
3. Connect your GitHub account

### Step 2: Create New Project
1. Click "New Project"
2. Select "Import Git Repository"
3. Choose your EchoAid repository
4. Vercel will auto-detect it's a React/Vite project

### Step 3: Configure Build Settings
1. **Framework Preset**: Vite
2. **Root Directory**: `frontend`
3. **Build Command**: `npm run build`
4. **Output Directory**: `dist`
5. **Install Command**: `npm install`

### Step 4: Add Environment Variables
1. Go to "Environment Variables" tab
2. Add all the variables listed above
3. **IMPORTANT**: Replace `your-railway-backend.railway.app` with your actual Railway URL

### Step 5: Deploy
1. Click "Deploy"
2. Wait for build to complete
3. Get your Vercel URL (e.g., `https://echoaid-frontend.vercel.app`)

### Step 6: Update Backend CORS
1. Go to Railway dashboard
2. Update `FRONTEND_URL` environment variable
3. Set it to your Vercel URL
4. Restart Railway service

## 🔧 TROUBLESHOOTING

### Common Issues:
1. **Build Failures**: Check Node.js version compatibility
2. **API Connection**: Verify Railway backend URL
3. **Environment Variables**: Ensure all required variables are set
4. **CORS Issues**: Update backend FRONTEND_URL

### Debug Commands:
```bash
# Test frontend build locally
cd frontend
npm run build

# Test API connection
curl https://your-railway-url.railway.app/api/health
```

## 📊 MONITORING

### Vercel Dashboard:
- View deployment logs
- Monitor build performance
- Check error logs
- View analytics

### Health Checks:
- Frontend loads correctly
- API calls work
- Authentication flow
- All features functional

## 🎯 POST-DEPLOYMENT

### Update Backend URLs:
1. Update `FRONTEND_URL` in Railway
2. Update `BACKEND_URL` in Railway
3. Restart Railway service
4. Test full application

### Domain Setup (Optional):
1. Configure custom domain in Vercel
2. Update DNS settings
3. Enable HTTPS

## ✅ SUCCESS CRITERIA

- [ ] Frontend deploys successfully
- [ ] API calls work correctly
- [ ] Authentication works
- [ ] All pages load
- [ ] Database connection works
- [ ] File uploads work
- [ ] Payment integration works
- [ ] AI Coach works

## 🚨 IMPORTANT NOTES

1. **Update Railway URLs** after deployment
2. **Test all functionality** before going live
3. **Monitor logs** for any issues
4. **Keep backups** of your data

## 📞 SUPPORT

If you encounter issues:
1. Check Vercel build logs
2. Verify environment variables
3. Test API connection
4. Contact support if needed

---

**Ready to deploy frontend! Follow these steps carefully for a successful deployment.** 🚀