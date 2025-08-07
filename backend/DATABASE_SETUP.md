# 🗄️ Database Setup Guide for EchoAid Microservices

## 📋 Overview

EchoAid uses a **microservices architecture** with separate databases for each service to ensure scalability, maintainability, and data isolation.

## 🏗️ Database Architecture

### **1. Main Database (Auth Service)**
- **Purpose**: User authentication, profiles, and core user data
- **Database**: `echoaid_main`
- **Collections**: `users`, `sessions`, `tokens`
- **Technology**: MongoDB

### **2. Dictionary Database**
- **Purpose**: Sign language dictionary and metadata
- **Database**: `echoaid_dictionary`
- **Collections**: `signs`, `categories`, `tags`
- **Technology**: MongoDB + File Storage
- **File Storage**: Images stored in filesystem, metadata in database

### **3. Quiz Database**
- **Purpose**: Quizzes, questions, and user quiz results
- **Database**: `echoaid_quiz`
- **Collections**: `quizzes`, `questions`, `quiz_attempts`, `user_progress`
- **Technology**: MongoDB

### **4. Forum Database**
- **Purpose**: Community forum, posts, comments
- **Database**: `echoaid_forum`
- **Collections**: `posts`, `comments`, `categories`, `tags`
- **Technology**: MongoDB

### **5. Video Database**
- **Purpose**: Video tutorials and content
- **Database**: `echoaid_video`
- **Collections**: `videos`, `playlists`, `video_analytics`
- **Technology**: MongoDB + File Storage
- **File Storage**: Videos stored in filesystem, metadata in database

## 🚀 Setup Instructions

### **1. Environment Variables**

Add these to your `config.env` file:

```env
# Main Database
MONGODB_URI=mongodb://localhost:27017/echoaid_main

# Microservice Databases
DICTIONARY_DB_URI=mongodb://localhost:27017/echoaid_dictionary
QUIZ_DB_URI=mongodb://localhost:27017/echoaid_quiz
FORUM_DB_URI=mongodb://localhost:27017/echoaid_forum
VIDEO_DB_URI=mongodb://localhost:27017/echoaid_video
```

### **2. Install MongoDB**

#### **Windows:**
```bash
# Download and install MongoDB Community Server
# https://www.mongodb.com/try/download/community
```

#### **macOS:**
```bash
brew install mongodb-community
brew services start mongodb-community
```

#### **Linux (Ubuntu):**
```bash
sudo apt update
sudo apt install mongodb
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### **3. Initialize Databases**

```bash
# Start MongoDB (if not running)
mongod

# In another terminal, run the database initialization
cd backend
npm run populate-db
```

### **4. Verify Setup**

```bash
# Check database health
npm run db:health

# Expected output:
# {
#   main: { status: 'connected', readyState: 1 },
#   dictionary: { status: 'connected', readyState: 1 },
#   quiz: { status: 'connected', readyState: 1 },
#   forum: { status: 'connected', readyState: 1 },
#   video: { status: 'connected', readyState: 1 }
# }
```

## 📊 Database Schema Overview

### **Sign Schema (Dictionary)**
```javascript
{
  word: String,           // The word/sign name
  category: String,       // alphabet, phrases, family, etc.
  difficulty: String,     // Beginner, Intermediate, Advanced
  description: String,    // Sign description
  imagePath: String,      // Path to image file
  thumbnailPath: String,  // Path to thumbnail
  videoPath: String,      // Path to video (future)
  tags: [String],         // Search tags
  stats: {                // Usage statistics
    views: Number,
    favorites: Number,
    practiceCount: Number
  },
  signLanguageType: String, // ASL, BSL, etc.
  handDominance: String,    // right, left, both
  isActive: Boolean
}
```

### **User Schema (Auth)**
```javascript
{
  name: String,
  email: String,
  password: String,
  googleId: String,
  avatar: String,
  learningStats: {        // Learning progress
    totalSignsLearned: Number,
    currentStreak: Number,
    totalXP: Number,
    level: Number
  }
}
```

## 🔄 Data Flow

### **Image Storage Strategy**
1. **Images**: Stored in filesystem (`backend/assets/signs/`)
2. **Metadata**: Stored in MongoDB
3. **Optimization**: Sharp library for on-demand resizing
4. **Caching**: Optimized images cached in `backend/assets/optimized/`

### **Current Status**
- ✅ **Images**: Your a-z and 0-9 images are in filesystem
- ✅ **Database**: Ready to store metadata
- ⏳ **Population**: Run `npm run populate-db` to add to database

## 🛠️ Management Commands

```bash
# Generate placeholder images
npm run generate-images

# Populate database with existing images
npm run populate-db

# Check database health
npm run db:health

# Start development server
npm run dev
```

## 📁 File Structure

```
backend/
├── assets/
│   └── signs/
│       ├── alphabet/     # Your a-z, 0-9 images
│       ├── phrases/      # Generated placeholders
│       ├── family/       # Generated placeholders
│       ├── activities/   # Generated placeholders
│       └── advanced/     # Generated placeholders
├── microservices/
│   ├── auth/
│   │   └── models/
│   │       └── User.js
│   ├── dictionary/
│   │   └── models/
│   │       └── Sign.js
│   ├── quiz/
│   │   └── models/
│   │       └── Quiz.js
│   ├── forum/
│   │   └── models/
│   │       └── Post.js
│   └── video/
│       └── models/
│           └── Video.js
├── config/
│   └── database.js       # Database configuration
└── scripts/
    └── populateSignsDatabase.js
```

## 🔧 Next Steps

1. **Run Database Population**: `npm run populate-db`
2. **Test API**: Verify dictionary endpoints work
3. **Add More Signs**: Upload more images and update database
4. **Implement Video Service**: Add video upload functionality
5. **Add Quiz Content**: Create quiz questions and answers
6. **Forum Features**: Implement community features

## 🚨 Important Notes

- **Images are NOT in database**: Only metadata is stored in MongoDB
- **File paths**: Images are referenced by file paths in the database
- **Optimization**: Images are optimized on-demand using Sharp
- **Scalability**: Each service has its own database for independent scaling
- **Backup**: Regular backups of both filesystem and databases recommended 