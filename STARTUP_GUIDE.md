# EchoAid Startup Guide

## 🚀 **Quick Start**

### 1. **Start Backend Server**
```bash
cd backend
npm start
```
The backend will run on `http://localhost:5000`

### 2. **Start Frontend Development Server**
```bash
cd frontend
npm run dev
```
The frontend will run on `http://localhost:5173`

### 3. **Access the Application**
- Open your browser and go to `http://localhost:5173`
- Log in with admin credentials
- Navigate to Admin Dashboard → Subscription Management

## 🔧 **Troubleshooting**

### **Backend Issues**
- Make sure MongoDB is running
- Check if `config.env` file exists in backend directory
- Verify all environment variables are set

### **Frontend Issues**
- Make sure you're using `npm run dev` (not `npm start`)
- Check if all dependencies are installed: `npm install`
- Clear browser cache if needed

### **Subscription Management Issues**
- Ensure you're logged in as admin
- Check browser console for any error messages
- Verify backend server is running and accessible

## 📋 **Prerequisites**

1. **Node.js** (v16 or higher)
2. **MongoDB** (running locally or accessible)
3. **npm** or **yarn** package manager

## 🎯 **Expected Behavior**

Once both servers are running:
1. Frontend loads at `http://localhost:5173`
2. Backend API available at `http://localhost:5000`
3. Subscription management accessible via Admin Dashboard
4. Transparent theme with light white lines should be visible

## 🆘 **Common Issues**

### **"Missing script: start" Error**
- Use `npm run dev` for frontend, not `npm start`
- Backend uses `npm start`

### **Module Import Errors**
- Run `npm install` in both frontend and backend directories
- Clear node_modules and reinstall if needed

### **Authentication Errors**
- Make sure you're logged in with admin privileges
- Check if JWT token is valid

The subscription management system is fully implemented and should work once both servers are running properly!