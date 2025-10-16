# EchoAid Subscription System Setup Guide

## 🚀 Quick Setup

### 1. Environment Configuration

The subscription system requires proper environment configuration. A `config.env` file has been created with test Razorpay keys.

**Important**: Replace the test keys with your actual Razorpay keys for production.

```bash
# In backend/config.env, update these values:
RAZORPAY_KEY_ID=rzp_test_your_actual_key_id
RAZORPAY_KEY_SECRET=your_actual_key_secret
```

### 2. Test Razorpay Integration

Run the test script to verify Razorpay connection:

```bash
cd backend
node test-razorpay.js
```

### 3. Start the Services

```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

## 🔧 Fixed Issues

### ✅ Redirection Problems
- Fixed role-based redirection logic to allow access to `/subscription` page
- Added proper navigation from dashboard to subscription page
- Updated sidebar to include subscription management link

### ✅ Subscription Page Access
- Users can now access subscription page without being redirected
- "Manage Subscription" button added to dashboard
- "Choose a Plan" button works properly for trial users

### ✅ Razorpay Integration
- Payment modal properly integrated with Razorpay
- Test keys configured for development
- Invoice and receipt generation implemented
- Email notifications with PDF attachments

## 📧 Email Configuration

For invoice emails to work, configure your email settings in `backend/config.env`:

```bash
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
EMAIL_FROM=your_email@gmail.com
```

## 🧪 Testing the Payment Flow

1. **Access Subscription Page**: Navigate to `/subscription` from dashboard or sidebar
2. **Select a Plan**: Choose Premium or Pro plan
3. **Test Payment**: Use Razorpay test mode with test cards
4. **Verify Email**: Check for invoice and receipt emails

### Test Cards (Razorpay Test Mode)
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## 📋 Features Implemented

### Payment Processing
- ✅ Razorpay order creation
- ✅ Payment verification
- ✅ Signature validation
- ✅ Subscription activation

### Invoice Generation
- ✅ PDF invoice generation
- ✅ PDF receipt generation
- ✅ Email with attachments
- ✅ Professional email templates

### User Experience
- ✅ Subscription status display
- ✅ Plan comparison
- ✅ Billing cycle toggle (monthly/yearly)
- ✅ Payment modal with status updates
- ✅ Success/failure handling

## 🔍 Troubleshooting

### Common Issues

1. **"Payment gateway configuration error"**
   - Check if Razorpay keys are set in `config.env`
   - Verify keys are correct and active

2. **"Razorpay script not loaded"**
   - Ensure Razorpay script is loaded in `index.html`
   - Check browser console for script errors

3. **Email not sending**
   - Verify email configuration in `config.env`
   - Check if Gmail app password is correct

4. **Redirection loops**
   - Clear browser cache and localStorage
   - Check role-based redirect logic

### Debug Steps

1. Check browser console for JavaScript errors
2. Check backend logs for API errors
3. Verify environment variables are loaded
4. Test Razorpay connection with test script

## 🚀 Production Deployment

### Before Going Live

1. **Replace Test Keys**: Update Razorpay keys to live keys
2. **Email Configuration**: Set up production email service
3. **SSL Certificate**: Ensure HTTPS for payment security
4. **Webhook Setup**: Configure Razorpay webhooks for payment events

### Security Checklist

- ✅ Environment variables properly configured
- ✅ Payment signature verification implemented
- ✅ HTTPS enabled for payment pages
- ✅ Input validation on payment forms
- ✅ Rate limiting on payment endpoints

## 📞 Support

If you encounter any issues:

1. Check this guide first
2. Review browser console errors
3. Check backend server logs
4. Test with Razorpay test mode first

The subscription system is now fully functional with proper error handling, invoice generation, and email notifications!