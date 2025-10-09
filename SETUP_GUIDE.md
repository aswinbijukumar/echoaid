# 🚀 EchoAid Project Setup Guide

## 📋 **Daily Workflow - What to Do Every Time You Work on the Project**

### **Step 1: Start Your Development Environment**

```bash
# Navigate to project root
cd D:\echoaid

# Start Backend Server (Node.js + MongoDB)
cd backend
npm start
# Keep this terminal open - Backend runs on port 5000
```

### **Step 2: Start Frontend (In a SECOND Terminal)**

```bash
# Navigate to frontend directory
cd D:\echoaid\frontend

# Install dependencies (only first time)
npm install

# Start frontend development server
npm run dev
# Frontend runs on port 5173
```

## 🔧 **Notes**
This setup now runs only the Node.js backend and React frontend. The previous Python ML service has been removed.

## 🌐 **Service URLs**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Backend Health Check**: http://localhost:5000/api/health

## 🚨 **Common Issues & Solutions**

### **Issue 1: "ModuleNotFoundError"**
```bash
# Solution: Activate virtual environment first
cd D:\echoaid\backend\recognition\python_service
.venv\Scripts\activate
pip install -r requirements.txt
```

### **Issue 2: "Port already in use"**
```bash
# Solution: Kill processes using the ports
# For Windows:
netstat -ano | findstr :5000
netstat -ano | findstr :5173
# Then kill the process using: taskkill /PID <process_id> /F
```

### **Issue 3: "Virtual environment not found"**
```bash
# Solution: Recreate virtual environment
cd D:\echoaid\backend\recognition\python_service
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

## 📁 **Project Structure**

```
D:\echoaid\
├── backend/                 # Node.js backend
│   ├── server.js           # Main server file
│   ├── models/             # Database models
│   ├── routes/             # API routes
│   ├── controllers/        # Business logic
│   └── recognition/        # (removed)
├── frontend/               # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── SETUP_GUIDE.md         # This file
```

## 🎯 **Quick Start Commands**

### **Start Everything (2 terminals needed):**

**Terminal 1 - Backend:**
```bash
cd D:\echoaid\backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd D:\echoaid\frontend
npm run dev
```

## ✅ **Verification Checklist**

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] All services responding to health checks

## 🔄 **Daily Workflow Summary**

1. **Open 2 terminals**
2. **Terminal 1**: Start backend (`cd backend && npm start`)
3. **Terminal 2**: Start frontend (`cd frontend && npm run dev`)
4. **Test**: Visit http://localhost:5173

## 🆘 **Emergency Reset**

If everything breaks:
```bash
# Kill all processes
taskkill /f /im node.exe
# Restart everything following the Quick Start Commands above
```

---

**Remember**: Always activate the virtual environment (`.venv\Scripts\activate`) before running Python services!