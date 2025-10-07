import Sign from '../models/Sign.js';
import Category from '../models/Category.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import { v2 as cloudinary } from 'cloudinary';

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
            resource_type: 'image'
          });
          sign.imagePath = uploaded.secure_url;
          sign.thumbnailPath = cloudinary.url(uploaded.public_id, { width: 200, height: 200, crop: 'fit', quality: 'auto', secure: true, format: 'jpg' });
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

// @desc    Bulk operations on signs
// @route   POST /api/admin/content/signs/bulk
// @access  Private (Admin, Super Admin)
export const bulkSignOperations = async (req, res) => {
  try {
    const { operation, signIds, data } = req.body;
    
    if (!operation || !signIds || !Array.isArray(signIds)) {
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
        // Get signs to delete their files
        const signsToDelete = await Sign.find({ _id: { $in: signIds } });
        
        // Delete associated files
        signsToDelete.forEach(sign => {
          if (sign.imagePath && fs.existsSync(sign.imagePath)) {
            fs.unlinkSync(sign.imagePath);
          }
          if (sign.thumbnailPath && fs.existsSync(sign.thumbnailPath)) {
            fs.unlinkSync(sign.thumbnailPath);
          }
          if (sign.videoPath && fs.existsSync(sign.videoPath)) {
            fs.unlinkSync(sign.videoPath);
          }
        });
        
        result = await Sign.deleteMany({ _id: { $in: signIds } });
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
    console.log('createCategory called by user:', req.user?.email, 'role:', req.user?.role);
    const { name, description, icon, color } = req.body || {};
    let { order } = req.body || {};

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Category name is required' });
    }

    // Normalize slug and order
    const normalizedSlug = name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    order = Number.isFinite(Number(order)) ? Number(order) : 0;

    // Check conflicts by name or slug
    const existingCategory = await Category.findOne({
      $or: [
        { name: { $regex: new RegExp(`^${name}$`, 'i') } },
        { slug: { $regex: new RegExp(`^${normalizedSlug}$`, 'i') } }
      ]
    });

    if (existingCategory) {
      return res.status(400).json({ success: false, message: 'Category with this name already exists' });
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
    console.error('createCategory error:', error);
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