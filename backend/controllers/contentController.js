import Sign from '../microservices/dictionary/models/Sign.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    if (typeof isActive === 'boolean') filter.isActive = isActive;
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
    
    // Handle file uploads
    let imagePath = null;
    let thumbnailPath = null;
    let videoPath = null;
    
    if (req.files) {
      if (req.files.image) {
        const imageFile = req.files.image;
        const imageName = `${Date.now()}-${imageFile.name}`;
        const imageDir = path.join(__dirname, '..', 'assets', 'signs', category);
        
        // Ensure directory exists
        if (!fs.existsSync(imageDir)) {
          fs.mkdirSync(imageDir, { recursive: true });
        }
        
        imagePath = path.join(imageDir, imageName);
        await imageFile.mv(imagePath);
        
        // Convert to relative path for frontend
        imagePath = `/assets/signs/${category}/${imageName}`;
        
        // Create thumbnail
        const thumbnailName = `thumb-${imageName}`;
        const thumbnailDir = path.join(__dirname, '..', 'assets', 'optimized', category);
        
        if (!fs.existsSync(thumbnailDir)) {
          fs.mkdirSync(thumbnailDir, { recursive: true });
        }
        
        thumbnailPath = path.join(thumbnailDir, thumbnailName);
        
        // Generate thumbnail using sharp
        await sharp(path.join(__dirname, '..', 'assets', 'signs', category, imageName))
          .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(thumbnailPath);
        
        // Convert to relative path for frontend
        thumbnailPath = `/assets/optimized/${category}/${thumbnailName}`;
      }
      
      if (req.files.video) {
        const videoFile = req.files.video;
        const videoName = `${Date.now()}-${videoFile.name}`;
        const videoDir = path.join(__dirname, '..', 'assets', 'videos', category);
        
        if (!fs.existsSync(videoDir)) {
          fs.mkdirSync(videoDir, { recursive: true });
        }
        
        videoPath = path.join(videoDir, videoName);
        await videoFile.mv(videoPath);
        
        // Convert to relative path for frontend
        videoPath = `/assets/videos/${category}/${videoName}`;
      }
    }
    
    const sign = await Sign.create({
      word,
      category,
      difficulty,
      description,
      imagePath: imagePath || req.body.imagePath,
      thumbnailPath: thumbnailPath || req.body.thumbnailPath,
      videoPath: videoPath || req.body.videoPath,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      usage,
      signLanguageType,
      handDominance,
      isActive: isActive === 'true' || isActive === true,
      facialExpression,
      bodyPosition,
      movement,
      relatedSigns: relatedSigns ? relatedSigns.split(',').map(id => id.trim()) : [],
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
    
    // Handle file uploads
    if (req.files) {
      if (req.files.image) {
        const imageFile = req.files.image;
        const imageName = `${Date.now()}-${imageFile.name}`;
        const imageDir = path.join(__dirname, '..', 'assets', 'signs', category || sign.category);
        
        if (!fs.existsSync(imageDir)) {
          fs.mkdirSync(imageDir, { recursive: true });
        }
        
        const newImagePath = path.join(imageDir, imageName);
        await imageFile.mv(newImagePath);
        
        // Delete old image if it exists
        if (sign.imagePath && fs.existsSync(path.join(__dirname, '..', sign.imagePath))) {
          fs.unlinkSync(path.join(__dirname, '..', sign.imagePath));
        }
        
        // Convert to relative path for frontend
        sign.imagePath = `/assets/signs/${category || sign.category}/${imageName}`;
        
        // Create new thumbnail
        const thumbnailName = `thumb-${imageName}`;
        const thumbnailDir = path.join(__dirname, '..', 'assets', 'optimized', category || sign.category);
        
        if (!fs.existsSync(thumbnailDir)) {
          fs.mkdirSync(thumbnailDir, { recursive: true });
        }
        
        const newThumbnailPath = path.join(thumbnailDir, thumbnailName);
        
        await sharp(newImagePath)
          .resize(200, 200, { fit: 'inside', withoutEnlargement: true })
          .jpeg({ quality: 80 })
          .toFile(newThumbnailPath);
        
        // Delete old thumbnail if it exists
        if (sign.thumbnailPath && fs.existsSync(path.join(__dirname, '..', sign.thumbnailPath))) {
          fs.unlinkSync(path.join(__dirname, '..', sign.thumbnailPath));
        }
        
        // Convert to relative path for frontend
        sign.thumbnailPath = `/assets/optimized/${category || sign.category}/${thumbnailName}`;
      }
      
      if (req.files.video) {
        const videoFile = req.files.video;
        const videoName = `${Date.now()}-${videoFile.name}`;
        const videoDir = path.join(__dirname, '..', 'assets', 'videos', category || sign.category);
        
        if (!fs.existsSync(videoDir)) {
          fs.mkdirSync(videoDir, { recursive: true });
        }
        
        const newVideoPath = path.join(videoDir, videoName);
        await videoFile.mv(newVideoPath);
        
        // Delete old video if it exists
        if (sign.videoPath && fs.existsSync(path.join(__dirname, '..', sign.videoPath))) {
          fs.unlinkSync(path.join(__dirname, '..', sign.videoPath));
        }
        
        // Convert to relative path for frontend
        sign.videoPath = `/assets/videos/${category || sign.category}/${videoName}`;
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
    
    // Delete associated files
    if (sign.imagePath && fs.existsSync(path.join(__dirname, '..', sign.imagePath))) {
      fs.unlinkSync(path.join(__dirname, '..', sign.imagePath));
    }
    
    if (sign.thumbnailPath && fs.existsSync(path.join(__dirname, '..', sign.thumbnailPath))) {
      fs.unlinkSync(path.join(__dirname, '..', sign.thumbnailPath));
    }
    
    if (sign.videoPath && fs.existsSync(path.join(__dirname, '..', sign.videoPath))) {
      fs.unlinkSync(path.join(__dirname, '..', sign.videoPath));
    }
    
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