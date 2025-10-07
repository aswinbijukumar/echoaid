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

### **Step 2: Start Python ML Service (In a NEW Terminal)**

```bash
# Navigate to Python service directory
cd D:\echoaid\backend\recognition\python_service

# Activate virtual environment
.venv\Scripts\activate

# Start Python service
python app/yolov5_main.py
# Keep this terminal open - Python service runs on port 8001
```

### **Step 3: Start Frontend (In a THIRD Terminal)**

```bash
# Navigate to frontend directory
cd D:\echoaid\frontend

# Install dependencies (only first time)
npm install

# Start frontend development server
npm run dev
# Frontend runs on port 5173
```

## 🔧 **Virtual Environment Management**

### **For Python Service:**
```bash
# Always activate virtual environment before running Python
cd D:\echoaid\backend\recognition\python_service
.venv\Scripts\activate

# Verify you're in the right environment
python -c "import sys; print(sys.executable)"
# Should show: D:\echoaid\backend\recognition\python_service\.venv\Scripts\python.exe
```

### **If Virtual Environment Issues Occur:**

1. **Deactivate any existing environment:**
   ```bash
   deactivate
   ```

2. **Navigate to Python service directory:**
   ```bash
   cd D:\echoaid\backend\recognition\python_service
   ```

3. **Activate the correct virtual environment:**
   ```bash
   .venv\Scripts\activate
   ```

4. **Install missing dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

## 🌐 **Service URLs**

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **Python ML Service**: http://localhost:8001
- **Backend Health Check**: http://localhost:5000/api/health
- **Python Health Check**: http://localhost:8001/health

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
netstat -ano | findstr :8001
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
│   └── recognition/        # Python ML service
│       └── python_service/
│           ├── .venv/      # Python virtual environment
│           ├── app/        # Python application
│           └── requirements.txt
├── frontend/               # React frontend
│   ├── src/
│   ├── public/
│   └── package.json
└── SETUP_GUIDE.md         # This file
```

## 🎯 **Quick Start Commands**

### **Start Everything (3 terminals needed):**

**Terminal 1 - Backend:**
```bash
cd D:\echoaid\backend
npm start
```

**Terminal 2 - Python Service:**
```bash
cd D:\echoaid\backend\recognition\python_service
.venv\Scripts\activate
python app/yolov5_main.py
```

**Terminal 3 - Frontend:**
```bash
cd D:\echoaid\frontend
npm run dev
```

## ✅ **Verification Checklist**

- [ ] Backend running on port 5000
- [ ] Python service running on port 8001
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] All services responding to health checks

## 🔄 **Daily Workflow Summary**

1. **Open 3 terminals**
2. **Terminal 1**: Start backend (`cd backend && npm start`)
3. **Terminal 2**: Start Python service (`cd python_service && .venv\Scripts\activate && python app/yolov5_main.py`)
4. **Terminal 3**: Start frontend (`cd frontend && npm run dev`)
5. **Test**: Visit http://localhost:5173

## 🆘 **Emergency Reset**

If everything breaks:
```bash
# Kill all processes
taskkill /f /im node.exe
taskkill /f /im python.exe

# Restart everything following the Quick Start Commands above
```

---

**Remember**: Always activate the virtual environment (`.venv\Scripts\activate`) before running Python services!