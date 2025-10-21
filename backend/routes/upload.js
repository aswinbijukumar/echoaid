import express from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { v2 as cloudinary } from 'cloudinary';
import { protect, adminAndSuperAdmin } from '../middleware/roleAuth.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Test endpoint to check if upload route is working
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Upload route is working',
    timestamp: new Date().toISOString()
  });
});

// Debug endpoint to check Cloudinary configuration (public for testing)
router.get('/debug', (req, res) => {
  const config = cloudinary.config();
  res.json({
    success: true,
    message: 'Cloudinary debug info',
    cloudinary: {
      hasApiKey: !!config.api_key,
      hasCloudName: !!config.cloud_name,
      hasApiSecret: !!config.api_secret,
      cloudName: config.cloud_name
    },
    environment: {
      hasCloudinaryUrl: !!process.env.CLOUDINARY_URL,
      hasCloudName: !!process.env.CLOUDINARY_CLOUD_NAME,
      hasApiKey: !!process.env.CLOUDINARY_API_KEY,
      hasApiSecret: !!process.env.CLOUDINARY_API_SECRET
    }
  });
});

// Configure Cloudinary
function ensureCloudinaryConfigured() {
  const config = cloudinary.config();
  
  // If already configured, return
  if (config.api_key) {
    return;
  }
  
  // Try CLOUDINARY_URL first
  if (process.env.CLOUDINARY_URL) {
    cloudinary.config({ secure: true });
    console.log('Cloudinary configured using CLOUDINARY_URL');
    return;
  }
  
  // Try individual environment variables
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
    console.log('Cloudinary configured using individual environment variables');
    return;
  }
  
  console.error('Cloudinary configuration not found in environment variables');
}

// Configure multer for file uploads (memory storage for Cloudinary)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/gif': 'gif',
    'image/webp': 'webp',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/avi': 'avi',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/ogg': 'ogg',
    'audio/mp4': 'm4a'
  };

  if (allowedTypes[file.mimetype]) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only images, videos, and audio files are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB limit
  }
});

// Add error handling middleware
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File too large. Maximum size is 50MB.'
      });
    }
    if (error.code === 'LIMIT_UNEXPECTED_FILE') {
      return res.status(400).json({
        success: false,
        message: 'Unexpected file field.'
      });
    }
  }
  next(error);
};

// Upload endpoint
router.post('/', protect, adminAndSuperAdmin, upload.single('file'), handleUploadError, async (req, res) => {
  try {
    console.log('Upload request received:', {
      hasFile: !!req.file,
      fileSize: req.file?.size,
      fileName: req.file?.originalname,
      fileType: req.file?.mimetype
    });

    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No file uploaded'
      });
    }

    // Ensure Cloudinary is configured
    ensureCloudinaryConfigured();

    const cloudinaryConfig = cloudinary.config();
    console.log('Cloudinary config:', {
      hasApiKey: !!cloudinaryConfig.api_key,
      hasCloudName: !!cloudinaryConfig.cloud_name,
      hasApiSecret: !!cloudinaryConfig.api_secret
    });

    if (!cloudinaryConfig.api_key && !process.env.CLOUDINARY_URL) {
      console.error('Cloudinary not configured properly - using local storage fallback');
      
      // Fallback to local storage
      const fs = await import('fs');
      const crypto = await import('crypto');
      
      // Create uploads directory if it doesn't exist
      const uploadsDir = path.join(__dirname, '..', 'uploads', 'learning-modules');
      if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
      }
      
      // Generate unique filename
      const fileExtension = path.extname(req.file.originalname);
      const uniqueName = crypto.randomUUID() + fileExtension;
      const filePath = path.join(uploadsDir, uniqueName);
      
      // Save file locally
      fs.writeFileSync(filePath, req.file.buffer);
      
      // Return local file path
      const localUrl = `/uploads/learning-modules/${uniqueName}`;
      
      return res.status(200).json({
        success: true,
        message: 'File uploaded successfully to local storage',
        filePath: localUrl,
        originalName: req.file.originalname,
        size: req.file.size,
        mimetype: req.file.mimetype
      });
    }

    // Upload to Cloudinary using buffer
    const uploaded = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream({
        resource_type: 'auto',
        folder: 'echoaid/learning-modules',
        use_filename: true,
        unique_filename: true
      }, (error, result) => {
        if (error) {
          console.error('Cloudinary upload error:', error);
          reject(error);
        } else {
          console.log('Cloudinary upload successful:', result.secure_url);
          resolve(result);
        }
      }).end(req.file.buffer);
    });

    res.status(200).json({
      success: true,
      message: 'File uploaded successfully to Cloudinary',
      filePath: uploaded.secure_url,
      publicId: uploaded.public_id,
      originalName: req.file.originalname,
      size: req.file.size,
      mimetype: req.file.mimetype
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error uploading file';
    if (error.message.includes('Cloudinary')) {
      errorMessage = 'Cloudinary upload failed: ' + error.message;
    } else if (error.message.includes('file')) {
      errorMessage = 'File processing error: ' + error.message;
    } else {
      errorMessage = error.message || 'Unknown upload error';
    }
    
    res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Multiple file upload endpoint
router.post('/multiple', protect, adminAndSuperAdmin, upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    // Ensure Cloudinary is configured
    ensureCloudinaryConfigured();

    if (!cloudinary.config().api_key && !process.env.CLOUDINARY_URL) {
      return res.status(500).json({
        success: false,
        message: 'Cloudinary is not configured'
      });
    }

    const uploadedFiles = [];

    for (const file of req.files) {
      try {
        // Upload to Cloudinary using buffer
        const uploaded = await new Promise((resolve, reject) => {
          cloudinary.uploader.upload_stream({
            resource_type: 'auto',
            folder: 'echoaid/learning-modules',
            use_filename: true,
            unique_filename: true
          }, (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          }).end(file.buffer);
        });

        uploadedFiles.push({
          filePath: uploaded.secure_url,
          publicId: uploaded.public_id,
          originalName: file.originalname,
          size: file.size,
          mimetype: file.mimetype
        });
      } catch (uploadError) {
        console.error('Error uploading file:', file.originalname, uploadError);
      }
    }

    res.status(200).json({
      success: true,
      message: 'Files uploaded successfully to Cloudinary',
      files: uploadedFiles
    });
  } catch (error) {
    console.error('Multiple upload error:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading files',
      error: error.message
    });
  }
});

export default router;
