# Frontend URL Fix Guide

## 🚨 Critical Issue Found

Your frontend has **many hardcoded localhost URLs** that are causing the 404 errors in production. This is why Google OAuth and other API calls are failing.

## 🔧 Solution: Replace All Hardcoded URLs

### **Step 1: Add Environment Variable in Vercel**

1. Go to your **Vercel Dashboard**
2. Select your EchoAid project  
3. Go to **Settings** → **Environment Variables**
4. Add this variable:
   - **Name**: `VITE_API_BASE_URL`
   - **Value**: `https://echoaid-production.up.railway.app`
   - **Environment**: Production (and Preview)

### **Step 2: Fix All Hardcoded URLs**

I've already fixed the Google OAuth URLs in Login.jsx and SignUp.jsx, but there are **many more** that need to be fixed.

## 📋 Files That Need URL Fixes

### **Critical Files (High Priority):**
- `frontend/src/pages/Login.jsx` ✅ **FIXED**
- `frontend/src/pages/SignUp.jsx` ✅ **FIXED** 
- `frontend/src/pages/OTPVerification.jsx` ❌ **NEEDS FIX**
- `frontend/src/pages/ResetPassword.jsx` ❌ **NEEDS FIX**
- `frontend/src/pages/Quiz.jsx` ❌ **NEEDS FIX**
- `frontend/src/pages/Profile.jsx` ❌ **NEEDS FIX**

### **Admin Files (Medium Priority):**
- `frontend/src/pages/AdminDashboard.jsx` ❌ **NEEDS FIX**
- `frontend/src/pages/AdminProfile.jsx` ❌ **NEEDS FIX**
- `frontend/src/pages/AdminMessages.jsx` ❌ **NEEDS FIX**

### **Component Files (Medium Priority):**
- `frontend/src/components/EnhancedQuiz.jsx` ❌ **NEEDS FIX**
- `frontend/src/components/ContentManagement.jsx` ❌ **NEEDS FIX**
- `frontend/src/components/SignsManagement.jsx` ❌ **NEEDS FIX**

## 🛠️ Quick Fix Pattern

Replace this pattern:
```javascript
// OLD (Hardcoded)
const response = await fetch('http://localhost:5000/api/auth/login', {

// NEW (Environment Variable)
const response = await fetch(`${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}/api/auth/login`, {
```

## 🚀 Immediate Action Required

1. **Add VITE_API_BASE_URL in Vercel** (Most Important!)
2. **Redeploy your frontend** 
3. **Test Google OAuth** - should work after environment variable is added

## 📊 Impact Assessment

- **Total files with hardcoded URLs**: ~30+ files
- **Critical for login**: 6 files
- **Critical for admin**: 8 files  
- **Critical for components**: 15+ files

## 🎯 Priority Order

1. **HIGH**: Add VITE_API_BASE_URL in Vercel (fixes Google OAuth immediately)
2. **MEDIUM**: Fix login/authentication related files
3. **LOW**: Fix admin and component files

## ✅ What's Already Fixed

- ✅ Google OAuth URLs in Login.jsx
- ✅ Google OAuth URLs in SignUp.jsx
- ✅ Backend is working correctly
- ✅ Database has 10 users
- ✅ Environment variables are set in Railway

## 🔍 Test After Fix

1. Visit: `https://echoaid.vercel.app`
2. Try Google OAuth login
3. Check browser console for errors
4. Test normal login

The Google OAuth should work immediately after adding the Vercel environment variable!