# EchoAid Deployment Fix Guide

## 🚨 Issues Found and Solutions

### 1. **Frontend-Backend Connection Issue**

**Problem**: Frontend can't connect to backend because environment variable is missing.

**Solution**: 
1. Go to your **Vercel Dashboard**
2. Select your EchoAid project
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://echoaid-production.up.railway.app`
   - **Environment**: Production (and Preview)

### 2. **Google OAuth Configuration**

**Problem**: Google OAuth redirect URIs not configured for production.

**Solution**:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to **APIs & Services** → **Credentials**
4. Edit your OAuth 2.0 Client ID
5. Add these **Authorized redirect URIs**:
   ```
   https://echoaid-production.up.railway.app/api/auth/google/callback
   https://echoaid.vercel.app
   https://echoaid.vercel.app/
   ```
6. Add these **Authorized JavaScript origins**:
   ```
   https://echoaid.vercel.app
   https://echoaid-production.up.railway.app
   ```

### 3. **Railway Environment Variables**

Make sure these are set in your **Railway Dashboard**:

1. Go to your Railway project
2. Go to **Variables** tab
3. Verify these variables exist:
   ```
   FRONTEND_URL=https://echoaid.vercel.app
   BACKEND_URL=https://echoaid-production.up.railway.app
   NODE_ENV=production
   JWT_SECRET=your_super_secret_jwt_key_here_make_it_long_and_random_echoaid_2024
   MONGODB_URI=mongodb+srv://oogysama:aswinrdjmessi5@cluster0.lm2mc3d.mongodb.net/echoaid?retryWrites=true&w=majority&appName=Cluster0
   GOOGLE_CLIENT_ID=your_google_client_id_here
   GOOGLE_CLIENT_SECRET=your_google_client_secret_here
   ```

### 4. **"Invalid Credentials" Error**

**Possible Causes**:
1. User doesn't exist in database
2. Password is incorrect
3. User account is not verified
4. JWT secret mismatch

**Debug Steps**:
1. Check if user exists: `abhinbijukumar@gmail.com` (found in database)
2. Try registering a new user first
3. Check if email verification is required

## 🔧 Quick Fix Commands

### Test Backend Connection:
```bash
cd backend
node test-connection.js
```

### Test Frontend Connection:
1. Open browser console on your Vercel site
2. Check if `VITE_API_BASE_URL` is loaded
3. Try making an API call

## 📋 Complete Checklist

### Vercel (Frontend):
- [ ] `VITE_API_BASE_URL` environment variable set
- [ ] Redeploy after adding environment variable

### Railway (Backend):
- [ ] All environment variables set
- [ ] Service is running and accessible
- [ ] CORS is properly configured

### Google Cloud Console:
- [ ] Authorized redirect URIs updated
- [ ] Authorized JavaScript origins updated
- [ ] OAuth consent screen configured

### Testing:
- [ ] Backend accessible at: `https://echoaid-production.up.railway.app`
- [ ] Frontend accessible at: `https://echoaid.vercel.app`
- [ ] API calls working from frontend
- [ ] Google OAuth working
- [ ] Normal login working

## 🚀 After Fixing

1. **Redeploy both services** after making changes
2. **Clear browser cache** and cookies
3. **Test with a fresh browser session**
4. **Check browser console** for any errors

## 📞 Support

If issues persist:
1. Check Railway logs for backend errors
2. Check Vercel logs for frontend errors
3. Check browser console for client-side errors
4. Verify all environment variables are set correctly

## 🔍 Current Status

✅ Backend: Working (10 users in database)
✅ Database: Connected
✅ Environment Variables: Set
❌ Frontend: Missing VITE_API_BASE_URL
❌ Google OAuth: Redirect URIs need updating