import Sign from '../models/Sign.js';
import Category from '../models/Category.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';
import csv from 'csv-parser';
import os from 'os';
import logger from '../utils/prettyLogger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy configuration helper so env is available even if this module is loaded before dotenv.config
function ensureCloudinaryConfigured() {
  const cfg = cloudinary.config();
  if (cfg && cfg.api_key) {
    return;
  }
  if (process.env.CLOUDINARY_URL) {
    try {
      // Explicitly parse CLOUDINARY_URL to populate api_key/secret
      const url = process.env.CLOUDINARY_URL.replace('cloudinary://', '');
      const [creds, cloud] = url.split('@');
      const [api_key, api_secret] = creds.split(':');
      const cloud_name = cloud?.split('/')[0];
      if (api_key && api_secret && cloud_name) {
        cloudinary.config({ cloud_name, api_key, api_secret, secure: true });
        return;
      }
    } catch {}
    // Fallback to letting SDK read env
    cloudinary.config({ secure: true });
    return;
  }
  if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
      secure: true
    });
  }
}

// Simple in-memory content queue (mock). In a real app, use DB collection.
let contentQueue = [
  {
    id: 'q1',
    type: 'image',
    title: 'Add new sign: Hello',
    submittedBy: 'admin@echoaid.com',
    submittedAt: new Date(Date.now() - 15 * 60 * 1000),
    payload: { word: 'Hello', category: 'phrases' }
  },
  {
    id: 'q2',
    type: 'lesson',
    title: 'Update lesson: Basic Hand Signs',
    submittedBy: 'content@echoaid.com',
    submittedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    payload: { lessonId: 'l1' }
  }
];

export const getContentQueue = async (req, res) => {
  try {
    res.status(200).json({ success: true, data: contentQueue });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateQueueItem = async (req, res) => {
  try {
    const { id } = req.params;
    const { approved, feedback } = req.body;
    const idx = contentQueue.findIndex(item => item.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, message: 'Queue item not found' });
    }

    // For demo: just remove from queue and return status
    const item = contentQueue[idx];
    contentQueue.splice(idx, 1);

    res.status(200).json({ success: true, data: { id, approved: !!approved, feedback: feedback || null, item } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// @desc    Get all signs with pagination and filtering
// @route   GET /api/admin/content/signs
// @access  Private (Admin, Super Admin)
export const getAllSigns = async (req, res) => {
  
  try {
    const { page = 1, limit = 10, category, difficulty, search, isActive } = req.query;
    
    // Build filter object
    const filter = {};
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty; 
    if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;
    if (search) {
      filter.$or = [
        { word: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const signs = await Sign.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Sign.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      data: signs,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Get sign by ID
// @route   GET /api/admin/content/signs/:id
// @access  Private (Admin, Super Admin)
export const getSignById = async (req, res) => {
  try {
    const sign = await Sign.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('relatedSigns', 'word category imagePath');
    
    if (!sign) {
      return res.status(404).json({
        success: false,
        message: 'Sign not found'
      });
    }
    
    res.status(200).json({
      success: true,
      data: sign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create new sign
// @route   POST /api/admin/content/signs
// @access  Private (Admin, Super Admin)
export const createSign = async (req, res) => {
  try {
    const {
      word,
      category,
      difficulty,
      description,
      tags,
      usage,
      signLanguageType,
      handDominance,
      facialExpression,
      bodyPosition,
      movement,
      relatedSigns,
      isActive
    } = req.body;
    
    // Basic validations
    if (!word || !word.trim()) {
      return res.status(400).json({ success: false, message: 'Word is required' });
    }
    if (!category || !category.trim()) {
      return res.status(400).json({ success: false, message: 'Category (slug) is required' });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: 'Description is required' });
    }

    // Ensure category slug exists and is active
    const existingCategory = await Category.findOne({ slug: category, isActive: true });
    if (!existingCategory) {
      return res.status(400).json({ success: false, message: 'Invalid or inactive category slug' });
    }
    
    // Handle file uploads
    let imagePath = null;
    let thumbnailPath = null;
    let videoPath = null;
    
    if (req.files) {
      if (req.files.image) {
        ensureCloudinaryConfigured();
        try {
          const imageFile = req.files.image;
          if (!cloudinary.config().api_key && !process.env.CLOUDINARY_URL) {
            return res.status(500).json({ success: false, message: 'Cloudinary is not configured' });
          }
          const filePath = imageFile.tempFilePath || imageFile.path || imageFile.filepath || (imageFile.data ? `data:${imageFile.mimetype};base64,${imageFile.data.toString('base64')}` : null);
          if (!filePath) {
            return res.status(400).json({ success: false, message: 'Temporary image file path not found' });
          }
          // Upload original image
          const uploaded = await cloudinary.uploader.upload(filePath, {
            folder: `echoaid/signs/${category}`,
            resource_type: 'auto'
          });
          imagePath = uploaded.secure_url;
          // Generate a transformed thumbnail URL (200x200)
          thumbnailPath = cloudinary.url(uploaded.public_id, { width: 200, height: 200, crop: 'fit', quality: 'auto', secure: true, format: 'jpg' });
        } catch (e) {
          return res.status(500).json({ success: false, message: 'Image upload failed', error: e.message });
        }
      }
      
      if (req.files.video) {
        ensureCloudinaryConfigured();
        try {
          const videoFile = req.files.video;
          if (!cloudinary.config().api_key && !process.env.CLOUDINARY_URL) {
            return res.status(500).json({ success: false, message: 'Cloudinary is not configured' });
          }
          const filePath = videoFile.tempFilePath || videoFile.path || videoFile.filepath || (videoFile.data ? `data:${videoFile.mimetype};base64,${videoFile.data.toString('base64')}` : null);
          if (!filePath) {
            return res.status(400).json({ success: false, message: 'Temporary video file path not found' });
          }
          const uploadedVideo = await cloudinary.uploader.upload(filePath, {
            folder: `echoaid/videos/${category}`,
            resource_type: 'auto'
          });
          videoPath = uploadedVideo.secure_url;
        } catch (e) {
          return res.status(500).json({ success: false, message: 'Video upload failed', error: e.message });
        }
      }
    }
    
    if (!imagePath && !req.body.imagePath) {
      return res.status(400).json({ success: false, message: 'Image is required' });
    }

    // Normalize tags (support both CSV string and array)
    let normalizedTags = [];
    if (Array.isArray(tags)) {
      normalizedTags = tags.map(t => String(t).trim()).filter(Boolean);
    } else if (typeof tags === 'string') {
      normalizedTags = tags.split(',').map(t => t.trim()).filter(Boolean);
    }

    // Ensure thumbnail fallback to image if not provided
    const effectiveImagePath = imagePath || req.body.imagePath;
    const effectiveThumbnailPath = (thumbnailPath || req.body.thumbnailPath || effectiveImagePath);

    const sign = await Sign.create({
      word,
      category,
      difficulty: difficulty || 'Beginner',
      description,
      imagePath: effectiveImagePath,
      thumbnailPath: effectiveThumbnailPath,
      videoPath: videoPath || req.body.videoPath,
      tags: normalizedTags,
      usage,
      signLanguageType,
      handDominance,
      isActive: isActive === 'true' || isActive === true,
      facialExpression,
      bodyPosition,
      movement,
      relatedSigns: Array.isArray(relatedSigns) ? relatedSigns : (relatedSigns ? relatedSigns.split(',').map(id => id.trim()) : []),
      createdBy: req.user._id
    });
    
    const populatedSign = await Sign.findById(sign._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json({
      success: true,
      message: 'Sign created successfully',
      data: populatedSign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Update sign
// @route   PUT /api/admin/content/signs/:id
// @access  Private (Admin, Super Admin)
export const updateSign = async (req, res) => {
  try {
    const sign = await Sign.findById(req.params.id);
    
    if (!sign) {
      return res.status(404).json({
        success: false,
        message: 'Sign not found'
      });
    }
    
    const {
      word,
      category,
      difficulty,
      description,
      tags,
      usage,
      signLanguageType,
      handDominance,
      facialExpression,
      bodyPosition,
      movement,
      relatedSigns,
      isActive
    } = req.body;
    
    // Handle file uploads (upload new files to Cloudinary)
    if (req.files) {
      if (req.files.image) {
        ensureCloudinaryConfigured();
        try {
          const imageFile = req.files.image;
          if (!cloudinary.config().api_key && !process.env.CLOUDINARY_URL) {
            return res.status(500).json({ success: false, message: 'Cloudinary is not configured' });
          }
          const filePath = imageFile.tempFilePath || imageFile.path || imageFile.filepath || (imageFile.data ? `data:${imageFile.mimetype};base64,${imageFile.data.toString('base64')}` : null);
          if (!filePath) {
            return res.status(400).json({ success: false, message: 'Temporary image file path not found' });
          }
          const uploaded = await cloudinary.uploader.upload(filePath, {
            folder: `echoaid/signs/${category || sign.category}`,
            resource_type: 'image',
            quality: 'auto:good',
            fetch_format: 'auto'
          });
          sign.coverImage = uploaded.secure_url;
          sign.coverThumbnail = cloudinary.url(uploaded.public_id, { width: 200, height: 200, crop: 'fit', quality: 'auto', secure: true, format: 'jpg' });
          
          // Keep legacy fields for backward compatibility
          sign.imagePath = uploaded.secure_url;
          sign.thumbnailPath = sign.coverThumbnail;
        } catch (e) {
          return res.status(500).json({ success: false, message: 'Image upload failed', error: e.message });
        }
      }
      
      if (req.files.video) {
        ensureCloudinaryConfigured();
        try {
          const videoFile = req.files.video;
          if (!cloudinary.config().api_key && !process.env.CLOUDINARY_URL) {
            return res.status(500).json({ success: false, message: 'Cloudinary is not configured' });
          }
          const filePath = videoFile.tempFilePath || videoFile.path || videoFile.filepath || (videoFile.data ? `data:${videoFile.mimetype};base64,${videoFile.data.toString('base64')}` : null);
          if (!filePath) {
            return res.status(400).json({ success: false, message: 'Temporary video file path not found' });
          }
          const uploadedVideo = await cloudinary.uploader.upload(filePath, {
            folder: `echoaid/videos/${category || sign.category}`,
            resource_type: 'video'
          });
          sign.videoPath = uploadedVideo.secure_url;
        } catch (e) {
          return res.status(500).json({ success: false, message: 'Video upload failed', error: e.message });
        }
      }
    }
    
    // Update fields
    if (word) sign.word = word;
    if (category) sign.category = category;
    if (difficulty) sign.difficulty = difficulty;
    if (description) sign.description = description;
    if (tags) sign.tags = tags.split(',').map(tag => tag.trim());
    if (usage) sign.usage = usage;
    if (signLanguageType) sign.signLanguageType = signLanguageType;
    if (handDominance) sign.handDominance = handDominance;
    if (facialExpression) sign.facialExpression = facialExpression;
    if (bodyPosition) sign.bodyPosition = bodyPosition;
    if (movement) sign.movement = movement;
    if (relatedSigns) sign.relatedSigns = relatedSigns.split(',').map(id => id.trim());
    if (isActive !== undefined) sign.isActive = isActive === 'true' || isActive === true;
    
    // Ensure coverImage and coverThumbnail exist (for backward compatibility)
    if (!sign.coverImage && sign.imagePath) {
      sign.coverImage = sign.imagePath;
    }
    if (!sign.coverThumbnail && sign.thumbnailPath) {
      sign.coverThumbnail = sign.thumbnailPath;
    }
    
    // If still no cover image, use a default or skip validation
    if (!sign.coverImage) {
      sign.coverImage = sign.imagePath || 'https://via.placeholder.com/300x300?text=No+Image';
    }
    if (!sign.coverThumbnail) {
      sign.coverThumbnail = sign.thumbnailPath || 'https://via.placeholder.com/200x200?text=No+Image';
    }
    
    await sign.save();
    
    const updatedSign = await Sign.findById(sign._id)
      .populate('createdBy', 'name email')
      .populate('relatedSigns', 'word category imagePath');
    
    res.status(200).json({
      success: true,
      message: 'Sign updated successfully',
      data: updatedSign
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Delete sign
// @route   DELETE /api/admin/content/signs/:id
// @access  Private (Admin, Super Admin)
export const deleteSign = async (req, res) => {
  try {
    const sign = await Sign.findById(req.params.id);
    
    if (!sign) {
      return res.status(404).json({
        success: false,
        message: 'Sign not found'
      });
    }
    
    // Best-effort delete for local files (legacy)
    try {
      if (sign.imagePath && !sign.imagePath.startsWith('http')) {
        const p = path.join(__dirname, '..', sign.imagePath);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      if (sign.thumbnailPath && !sign.thumbnailPath.startsWith('http')) {
        const p = path.join(__dirname, '..', sign.thumbnailPath);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
      if (sign.videoPath && !sign.videoPath.startsWith('http')) {
        const p = path.join(__dirname, '..', sign.videoPath);
        if (fs.existsSync(p)) fs.unlinkSync(p);
      }
    } catch {}
    
    await Sign.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Sign deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Create sign with multiple variants
// @route   POST /api/content/signs/bulk-variants
// @access  Private (Admin, Super Admin)
export const createSignWithVariants = async (req, res) => {
  try {
    // Ensure Cloudinary is configured
    ensureCloudinaryConfigured();
    
    const {
      word,
      category,
      difficulty,
      description,
      tags,
      usage,
      signLanguageType,
      handDominance,
      facialExpression,
      bodyPosition,
      movement,
      isActive
    } = req.body;

    // Comprehensive validations
    const validationErrors = [];

    // Word validation
    if (!word || !word.trim()) {
      validationErrors.push('Word is required');
    } else if (word.trim().length < 1) {
      validationErrors.push('Word must be at least 1 character long');
    } else if (word.trim().length > 100) {
      validationErrors.push('Word must be less than 100 characters');
    } else if (!/^[a-zA-Z0-9\s\-'.,!?]+$/.test(word.trim())) {
      validationErrors.push('Word contains invalid characters. Only letters, numbers, spaces, and basic punctuation are allowed');
    }

    // Category validation
    if (!category || !category.trim()) {
      validationErrors.push('Category is required');
    } else if (!['alphabet', 'numbers', 'phrases', 'family', 'activities', 'advanced'].includes(category.trim())) {
      validationErrors.push('Invalid category. Must be one of: alphabet, numbers, phrases, family, activities, advanced');
    }

    // Description validation with fallback
    logger.debug('Description validation', {
      rawDescription: description,
      type: typeof description,
      length: description ? description.length : 'undefined'
    }, 'BULK_UPLOAD');
    
    // Ensure description meets minimum length requirement
    let finalDescription = description;
    if (!description || description === '' || !description.trim()) {
      finalDescription = `Learn how to sign "${word}" in Indian Sign Language with proper hand gestures and movements`;
    } else if (description.trim().length < 10) {
      // If description is too short, extend it
      finalDescription = `${description.trim()} - Learn how to sign "${word}" in Indian Sign Language with proper hand gestures and movements`;
    }
    
    if (finalDescription.trim().length > 500) {
      validationErrors.push('Description must be less than 500 characters');
    }

    // Difficulty validation
    if (!difficulty) {
      validationErrors.push('Difficulty is required');
    } else if (!['Beginner', 'Intermediate', 'Advanced'].includes(difficulty)) {
      validationErrors.push('Invalid difficulty. Must be one of: Beginner, Intermediate, Advanced');
    }

    // Usage validation (optional)
    if (usage && usage.trim().length > 200) {
      validationErrors.push('Usage description must be less than 200 characters');
    }

    // Tags validation (optional)
    if (tags) {
      try {
        const parsedTags = JSON.parse(tags);
        if (!Array.isArray(parsedTags)) {
          validationErrors.push('Tags must be an array');
        } else if (parsedTags.length > 10) {
          validationErrors.push('Maximum 10 tags allowed');
        } else {
          parsedTags.forEach((tag, index) => {
            if (typeof tag !== 'string' || tag.trim().length === 0) {
              validationErrors.push(`Tag ${index + 1} must be a non-empty string`);
            } else if (tag.trim().length > 50) {
              validationErrors.push(`Tag ${index + 1} must be less than 50 characters`);
            }
          });
        }
      } catch (e) {
        validationErrors.push('Invalid tags format. Must be a valid JSON array');
      }
    }

    // Check for duplicate word in same category
    let existingSign = null;
    try {
      logger.debug('Checking for existing sign', {
        word: word.trim(),
        category: category.trim(),
        searchQuery: { 
          word: { $regex: new RegExp(`^${word.trim()}$`, 'i') }, 
          category: category.trim(),
          isActive: true 
        }
      }, 'BULK_UPLOAD');
      
      existingSign = await Sign.findOne({ 
        word: { $regex: new RegExp(`^${word.trim()}$`, 'i') }, 
        category: category.trim(),
        isActive: true 
      });
      
      if (existingSign) {
        logger.info('Found existing sign', {
          signId: existingSign._id,
          word: existingSign.word,
          category: existingSign.category,
          variantsCount: existingSign.variants ? existingSign.variants.length : 0,
          coverImage: existingSign.coverImage
        }, 'BULK_UPLOAD');
      } else {
        logger.info('No existing sign found', { word: word.trim(), category: category.trim() }, 'BULK_UPLOAD');
      }
      
      if (existingSign) {
        // Check if this is an update request (adding variants to existing sign)
        const isUpdateRequest = req.headers['x-update-existing'] === 'true';
        
        logger.debug('Duplicate check result', {
          existingSignId: existingSign._id,
          existingSignWord: existingSign.word,
          isUpdateRequest: isUpdateRequest,
          updateHeader: req.headers['x-update-existing'],
          allHeaders: Object.keys(req.headers).filter(h => h.toLowerCase().includes('update') || h.toLowerCase().includes('existing'))
        }, 'BULK_UPLOAD');
        
        if (!isUpdateRequest) {
          validationErrors.push(`Sign "${word}" already exists in ${category} category. Use update mode to add variants.`);
        } else {
          logger.info(`Adding variants to existing sign: ${word} (ID: ${existingSign._id})`, null, 'BULK_UPLOAD');
        }
      }
    } catch (dbError) {
      logger.errorWithStack('Database error during duplicate check', dbError, 'DATABASE');
      // Continue with other validations
    }

    // File validations
    if (!req.files || !req.files.coverFile) {
      validationErrors.push('Cover image is required');
    } else {
      const coverFile = req.files.coverFile;
      
      // File size validation (5MB limit)
      if (coverFile.size > 5 * 1024 * 1024) {
        validationErrors.push('Cover image must be less than 5MB');
      }
      
      // File type validation
      const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
      if (!allowedImageTypes.includes(coverFile.mimetype)) {
        validationErrors.push('Cover image must be JPEG, PNG, or GIF format');
      }
    }

    if (!req.files || !req.files.variantFiles) {
      validationErrors.push('At least one variant file is required');
    } else {
      const variantFiles = Array.isArray(req.files.variantFiles) ? req.files.variantFiles : [req.files.variantFiles];
      
      if (variantFiles.length > 10) {
        validationErrors.push('Maximum 10 variant files allowed per sign');
      }

      variantFiles.forEach((file, index) => {
        // File size validation
        if (file.size > 5 * 1024 * 1024) {
          validationErrors.push(`Variant ${index + 1} file must be less than 5MB`);
        }
        
        // File type validation
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4'];
        if (!allowedTypes.includes(file.mimetype)) {
          validationErrors.push(`Variant ${index + 1} must be JPEG, PNG, GIF, or MP4 format`);
        }
      });
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Handle cover image upload
    let coverImagePath = null;
    let coverThumbnailPath = null;
    
    if (req.files && req.files.coverFile) {
      const coverFile = req.files.coverFile;
      const filePath = coverFile.tempFilePath || coverFile.path;
      
      try {
        logger.info('Uploading cover image to Cloudinary...', null, 'CONTROLLER');
        logger.debug('File path:', filePath, 'CONTROLLER');
        logger.debug('Category:', category, 'CONTROLLER');
        
        const uploaded = await cloudinary.uploader.upload(filePath, {
          folder: `signs/${category}`,
          use_filename: true,
          unique_filename: true,
          // Optimize for web delivery
          quality: 'auto:good',
          fetch_format: 'auto'
        });
        
        logger.debug('Cover image uploaded successfully:', uploaded.secure_url, 'CONTROLLER');
        
        coverImagePath = uploaded.secure_url;
        coverThumbnailPath = cloudinary.url(uploaded.public_id, { 
          width: 200, 
          height: 200, 
          crop: 'fit', 
          quality: 'auto:eco', 
          secure: true, 
          format: 'jpg'
        });
      } catch (e) {
        logger.errorWithStack('Cover image upload error:', e, error, 'CONTROLLER');
        return res.status(500).json({ 
          success: false, 
          message: 'Cover image upload failed', 
          error: e.message,
          details: e
        });
      }
    }

    // Handle variant files upload
    const variants = [];
    if (req.files && req.files.variantFiles) {
      const variantFiles = Array.isArray(req.files.variantFiles) ? req.files.variantFiles : [req.files.variantFiles];
      const variantTypes = Array.isArray(req.body.variantTypes) ? req.body.variantTypes : [req.body.variantTypes];
      const variantAngles = Array.isArray(req.body.variantAngles) ? req.body.variantAngles : [req.body.variantAngles];
      const variantDescriptions = Array.isArray(req.body.variantDescriptions) ? req.body.variantDescriptions : [req.body.variantDescriptions];

      for (let i = 0; i < variantFiles.length; i++) {
        const variantFile = variantFiles[i];
        const filePath = variantFile.tempFilePath || variantFile.path;
        
        try {
          logger.info('Uploading variant ${i + 1} to Cloudinary...', null, 'CONTROLLER');
          logger.debug('File path:', filePath, 'CONTROLLER');
          logger.debug('Variant type:', variantTypes[i], 'CONTROLLER');
          
          const uploaded = await cloudinary.uploader.upload(filePath, {
            folder: `signs/${category}/variants`,
            use_filename: true,
            unique_filename: true,
            // Optimize for web delivery
            quality: 'auto:good',
            fetch_format: 'auto',
            // Video optimization
            resource_type: 'auto'
          });
          
          console.log(`Variant ${i + 1} uploaded successfully:`, uploaded.secure_url);
          
          variants.push({
            type: variantTypes[i] || 'image',
            path: uploaded.secure_url,
            thumbnail: cloudinary.url(uploaded.public_id, { 
              width: 150, 
              height: 150, 
              crop: 'fit', 
              quality: 'auto:eco', 
              secure: true, 
              format: 'jpg'
            }),
            description: variantDescriptions[i] || `${word} variant`,
            angle: variantAngles[i] || 'front',
            isDefault: i === 0
          });
        } catch (e) {
          logger.errorWithStack(`Variant ${i + 1} upload failed:`, e, error, 'CONTROLLER');
          // Continue with other variants but log the error
        }
      }
    }

    let sign;
    
    if (existingSign) {
      // Add variants to existing sign
      logger.info(`Adding ${variants.length} variants to existing sign: ${word}`, { 
        signId: existingSign._id,
        existingVariantsCount: existingSign.variants ? existingSign.variants.length : 0,
        newVariantsCount: variants.length
      }, 'BULK_UPLOAD');
      
      // Log existing sign details before modification
      logger.debug('Existing sign before modification', {
        signId: existingSign._id,
        word: existingSign.word,
        category: existingSign.category,
        existingVariants: existingSign.variants ? existingSign.variants.length : 0,
        coverImage: existingSign.coverImage,
        imagePath: existingSign.imagePath
      }, 'BULK_UPLOAD');
      
      // Add new variants to existing sign
      existingSign.variants = [...(existingSign.variants || []), ...variants];
      
      // Update other fields if provided
      if (finalDescription.trim()) existingSign.description = finalDescription.trim();
      if (difficulty) existingSign.difficulty = difficulty;
      if (tags) existingSign.tags = JSON.parse(tags);
      if (usage) existingSign.usage = usage;
      if (signLanguageType) existingSign.signLanguageType = signLanguageType;
      if (handDominance) existingSign.handDominance = handDominance;
      if (facialExpression) existingSign.facialExpression = facialExpression;
      if (bodyPosition) existingSign.bodyPosition = bodyPosition;
      if (movement) existingSign.movement = movement;
      
      // Update cover image ONLY if no cover image exists
      if (coverImagePath && (!existingSign.coverImage || !existingSign.imagePath)) {
        existingSign.coverImage = coverImagePath;
        existingSign.coverThumbnail = coverThumbnailPath;
        existingSign.imagePath = coverImagePath;
        existingSign.thumbnailPath = coverThumbnailPath;
        logger.info(`Updated cover image for existing sign: ${word}`, { signId: existingSign._id }, 'BULK_UPLOAD');
      } else if (coverImagePath) {
        logger.info(`Keeping existing cover image for sign: ${word}`, { 
          signId: existingSign._id,
          existingCover: existingSign.coverImage 
        }, 'BULK_UPLOAD');
      }
      
      // Update video path if new video variant added
      const videoVariant = variants.find(v => v.type === 'video');
      if (videoVariant) {
        existingSign.videoPath = videoVariant.path;
      }
      
      sign = await existingSign.save();
      
      // Log the result after saving
      logger.info(`Successfully updated existing sign: ${word}`, {
        signId: sign._id,
        totalVariants: sign.variants ? sign.variants.length : 0,
        coverImage: sign.coverImage,
        imagePath: sign.imagePath
      }, 'BULK_UPLOAD');
      
      res.status(200).json({
        success: true,
        message: `Added ${variants.length} variants to existing sign "${word}"`,
        data: sign
      });
    } else {
      // Create new sign with variants
      const signData = {
        word: word.trim(),
        category: category.trim(),
        difficulty: difficulty || 'Beginner',
        description: finalDescription.trim(),
        coverImage: coverImagePath,
        coverThumbnail: coverThumbnailPath,
        variants: variants,
        tags: tags ? JSON.parse(tags) : [word.toLowerCase()],
        usage: usage || `Common usage of ${word} in sign language`,
        signLanguageType: signLanguageType || 'ISL',
        handDominance: handDominance || 'right',
        facialExpression: facialExpression || '',
        bodyPosition: bodyPosition || '',
        movement: movement || '',
        isActive: isActive !== undefined ? isActive : true,
        createdBy: req.user._id,
        // Legacy fields for backward compatibility
        imagePath: coverImagePath,
        thumbnailPath: coverThumbnailPath,
        videoPath: variants.find(v => v.type === 'video')?.path || null
      };

      sign = await Sign.create(signData);

      res.status(201).json({
        success: true,
        message: `Sign "${word}" created successfully with ${variants.length} variants`,
        data: sign
      });
    }

  } catch (error) {
    logger.errorWithStack('Error creating sign with variants:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Bulk operations on signs
// @route   POST /api/admin/content/signs/bulk
// @access  Private (Admin, Super Admin)
export const bulkSignOperations = async (req, res) => {
  try {
    const { operation, signIds, data } = req.body;
    
    logger.debug('Bulk operation request:', { operation, signIds: signIds?.length, data }, 'CONTROLLER');
    
    if (!operation || !signIds || !Array.isArray(signIds)) {
      console.log('Invalid request parameters:', { operation, signIds, isArray: Array.isArray(signIds) });
      return res.status(400).json({
        success: false,
        message: 'Invalid request parameters'
      });
    }
    
    let result;
    
    switch (operation) {
      case 'activate':
        result = await Sign.updateMany(
          { _id: { $in: signIds } },
          { isActive: true }
        );
        break;
        
      case 'deactivate':
        result = await Sign.updateMany(
          { _id: { $in: signIds } },
          { isActive: false }
        );
        break;
        
      case 'delete':
        logger.debug('Processing bulk delete for signIds:', signIds, 'CONTROLLER');
        // Get signs to delete their files
        const signsToDelete = await Sign.find({ _id: { $in: signIds } });
        logger.debug('Found signs to delete:', signsToDelete.length, 'CONTROLLER');
        
        // Delete associated files
        signsToDelete.forEach(sign => {
          try {
            if (sign.imagePath && !sign.imagePath.startsWith('http')) {
              const imagePath = path.join(__dirname, '..', sign.imagePath);
              if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
                logger.debug('Deleted image file:', imagePath, 'CONTROLLER');
              }
            }
            if (sign.thumbnailPath && !sign.thumbnailPath.startsWith('http')) {
              const thumbnailPath = path.join(__dirname, '..', sign.thumbnailPath);
              if (fs.existsSync(thumbnailPath)) {
                fs.unlinkSync(thumbnailPath);
                logger.debug('Deleted thumbnail file:', thumbnailPath, 'CONTROLLER');
              }
            }
            if (sign.videoPath && !sign.videoPath.startsWith('http')) {
              const videoPath = path.join(__dirname, '..', sign.videoPath);
              if (fs.existsSync(videoPath)) {
                fs.unlinkSync(videoPath);
                logger.debug('Deleted video file:', videoPath, 'CONTROLLER');
              }
            }
          } catch (fileError) {
            console.warn('Error deleting file:', fileError.message);
          }
        });
        
        result = await Sign.deleteMany({ _id: { $in: signIds } });
        logger.debug('Bulk delete result:', result, 'CONTROLLER');
        break;
        
      case 'update':
        if (!data) {
          return res.status(400).json({
            success: false,
            message: 'Data is required for update operation'
          });
        }
        result = await Sign.updateMany(
          { _id: { $in: signIds } },
          data
        );
        break;
        
      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid operation'
        });
    }
    
    res.status(200).json({
      success: true,
      message: `Bulk operation '${operation}' completed successfully`,
      data: result
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Import signs from CSV (uploaded) with optional localize
// @route   POST /api/admin/content/signs/import
// @access  Private (Admin, Super Admin)
export const importSignsFromCsv = async (req, res) => {
  try {
    const { dedupe = 'merge', localize = 'url', categoryFallback = 'alphabet' } = req.body || {};
    if (!req.files || !req.files.file) {
      return res.status(400).json({ success: false, message: 'CSV file is required (field name: file)' });
    }

    const file = req.files.file;
    const rows = [];
    const parseCsv = () => new Promise((resolve, reject) => {
      const chunks = [];
      if (file.data) {
        chunks.push(file.data);
        const stream = Buffer.concat(chunks);
        const results = [];
        const r = require('stream').Readable.from(stream);
        r.pipe(csv())
          .on('data', (data) => results.push(data))
          .on('end', () => resolve(results))
          .on('error', reject);
      } else {
        reject(new Error('No file data'));
      }
    });

    const data = await parseCsv();
    let inserted = 0, updated = 0, skipped = 0;

    for (const row of data) {
      const word = (row.word || row.label || '').toString().trim();
      const category = (row.category || '').toString().trim() || categoryFallback;
      const description = (row.description || '').toString().trim() || `${word} sign`;
      const imagePath = (row.imagePath || row.image_url || row.imageUrl || '').toString().trim();
      const videoPath = (row.videoPath || row.video_url || row.videoUrl || '').toString().trim();
      const difficulty = (row.difficulty || 'Beginner').toString().trim();
      const tags = (row.tags || '').toString().split(/[;,]/).map(t => t.trim()).filter(Boolean);

      if (!word || !category || !imagePath) { skipped++; continue; }

      const existing = await Sign.findOne({ word, category });

      const doc = {
        word,
        category,
        description,
        difficulty,
        imagePath,
        thumbnailPath: row.thumbnailPath || imagePath,
        videoPath: videoPath || undefined,
        tags,
        isActive: true,
        createdBy: req.user._id
      };

      if (!existing) {
        await Sign.create(doc);
        inserted++;
      } else if (dedupe === 'overwrite') {
        await Sign.updateOne({ _id: existing._id }, doc);
        updated++;
      } else if (dedupe === 'merge') {
        const merged = { ...existing.toObject(), ...doc };
        await Sign.updateOne({ _id: existing._id }, merged);
        updated++;
      } else {
        skipped++;
      }
    }

    res.status(200).json({ success: true, data: { inserted, updated, skipped, total: data.length } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Import failed', error: error.message });
  }
};

// @desc    Get content statistics
// @route   GET /api/admin/content/stats
// @access  Private (Admin, Super Admin)
export const getContentStats = async (req, res) => {
  try {
    const totalSigns = await Sign.countDocuments();
    const activeSigns = await Sign.countDocuments({ isActive: true });
    const inactiveSigns = await Sign.countDocuments({ isActive: false });
    
    // Signs by category
    const signsByCategory = await Sign.aggregate([
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Signs by difficulty
    const signsByDifficulty = await Sign.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Signs by sign language type
    const signsByLanguage = await Sign.aggregate([
      {
        $group: {
          _id: '$signLanguageType',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Recent signs (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const recentSigns = await Sign.countDocuments({
      createdAt: { $gte: thirtyDaysAgo }
    });
    
    res.status(200).json({
      success: true,
      data: {
        totalSigns,
        activeSigns,
        inactiveSigns,
        signsByCategory,
        signsByDifficulty,
        signsByLanguage,
        recentSigns
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// @desc    Export signs data
// @route   GET /api/admin/content/signs/export
// @access  Private (Admin, Super Admin)
export const exportSigns = async (req, res) => {
  try {
    const { format = 'json', category, isActive } = req.query;
    
    const filter = {};
    if (category) filter.category = category;
    if (typeof isActive === 'boolean') filter.isActive = isActive;
    
    const signs = await Sign.find(filter)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 });
    
    if (format === 'csv') {
      // Convert to CSV format
      const csvData = signs.map(sign => ({
        word: sign.word,
        category: sign.category,
        difficulty: sign.difficulty,
        description: sign.description,
        tags: sign.tags.join(', '),
        usage: sign.usage,
        signLanguageType: sign.signLanguageType,
        handDominance: sign.handDominance,
        isActive: sign.isActive,
        createdAt: sign.createdAt,
        createdBy: sign.createdBy?.name || 'Unknown'
      }));
      
      const csvHeaders = Object.keys(csvData[0] || {}).join(',');
      const csvRows = csvData.map(row => Object.values(row).join(','));
      const csv = [csvHeaders, ...csvRows].join('\n');
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=signs-export.csv');
      res.send(csv);
    } else {
      res.status(200).json({
        success: true,
        data: signs
      });
    }
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Category Management Functions

// Get all categories
export const getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true })
      .sort({ order: 1, name: 1 })
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    // Update sign counts for each category
    for (let category of categories) {
      await category.updateSignCount();
    }

    res.status(200).json({
      success: true,
      data: categories
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Get category by ID
export const getCategoryById = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastModifiedBy', 'name email');

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    await category.updateSignCount();

    res.status(200).json({
      success: true,
      data: category
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Create new category
export const createCategory = async (req, res) => {
  try {
    logger.debug('createCategory called by user:', req.user?.email, 'role:', req.user?.role, 'CONTROLLER');
    const { name, description, icon, color, slug } = req.body || {};
    let { order } = req.body || {};

    // Comprehensive validation
    const validationErrors = [];

    // Name validation
    if (!name || !name.trim()) {
      validationErrors.push('Category name is required');
    } else if (name.trim().length < 2) {
      validationErrors.push('Category name must be at least 2 characters long');
    } else if (name.trim().length > 50) {
      validationErrors.push('Category name must be less than 50 characters');
    } else if (!/^[a-zA-Z0-9\s\-_]+$/.test(name.trim())) {
      validationErrors.push('Category name can only contain letters, numbers, spaces, hyphens, and underscores');
    }

    // Description validation (optional)
    if (description && description.trim().length > 200) {
      validationErrors.push('Description must be less than 200 characters');
    }

    // Color validation
    const validColors = ['bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 'bg-orange-500', 'bg-red-500', 'bg-teal-500', 'bg-yellow-500'];
    if (color && !validColors.includes(color)) {
      validationErrors.push('Invalid color selected');
    }

    // Order validation
    if (order !== undefined) {
      order = Number.isFinite(Number(order)) ? Number(order) : 0;
      if (order < 0 || order > 100) {
        validationErrors.push('Order must be between 0 and 100');
      }
    } else {
      order = 0;
    }

    // Return validation errors if any
    if (validationErrors.length > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Validation failed', 
        errors: validationErrors 
      });
    }

    // Generate or use provided slug
    const normalizedSlug = slug || name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    // Check conflicts by name or slug
    const existingCategory = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } },
        { slug: { $regex: new RegExp(`^${normalizedSlug}$`, 'i') } }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({ 
        success: false, 
        message: 'Category with this name or slug already exists',
        errors: ['A category with this name already exists']
      });
    }

    const category = await Category.create({
      name: name.trim(),
      slug: normalizedSlug,
      description: description || '',
      icon: icon || 'AcademicCapIcon',
      color: color || 'bg-blue-500',
      order,
      createdBy: req.user._id
    });

    return res.status(201).json({ success: true, data: category });
  } catch (error) {
    // Duplicate key friendly message
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }
    logger.errorWithStack('createCategory error:', error, error, 'CONTROLLER');
    return res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update category
export const updateCategory = async (req, res) => {
  try {
    const { name, description, icon, color, isActive } = req.body || {};
    let { order } = req.body || {};

    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if new name conflicts with existing categories
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({ 
        _id: { $ne: req.params.id },
        $or: [
          { name: { $regex: new RegExp(`^${name}$`, 'i') } },
          { slug: { $regex: new RegExp(`^${name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')}$`, 'i') } }
        ]
      });

      if (existingCategory) {
        return res.status(400).json({
          success: false,
          message: 'Category with this name already exists'
        });
      }
    }

    // Normalize values
    const updateDoc = {
      ...(name && { name: name.trim(), slug: name
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '') }),
      ...(description !== undefined && { description }),
      ...(icon && { icon }),
      ...(color && { color }),
      ...(order !== undefined && { order: Number.isFinite(Number(order)) ? Number(order) : category.order }),
      ...(isActive !== undefined && { isActive }),
      lastModifiedBy: req.user._id
    };

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      updateDoc,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedCategory
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
    }
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};

// Delete category
export const deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: 'Category not found'
      });
    }

    // Check if category has signs
    const signCount = await Sign.countDocuments({ category: category.slug });
    if (signCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete category. It contains ${signCount} signs. Please move or delete the signs first.`
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
}; 
