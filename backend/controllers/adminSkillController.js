import Skill from '../models/Skill.js';

import logger from '../utils/prettyLogger.js';
// Get all skills for admin management
export const getAdminSkills = async (req, res) => {
  try {
    const skills = await Skill.find()
      .populate('createdBy', 'name email')
      .populate('signs', 'word category difficulty')
      .populate('targetSign', 'word category difficulty')
      .sort({ category: 1, order: 1 });

    res.status(200).json({
      success: true,
      data: skills
    });
  } catch (error) {
    logger.errorWithStack('Get admin skills error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Get skill by ID
export const getSkillById = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('signs', 'word category difficulty')
      .populate('targetSign', 'word category difficulty');

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    res.status(200).json({
      success: true,
      data: skill
    });
  } catch (error) {
    logger.errorWithStack('Get skill by ID error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Create new skill
export const createSkill = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      order,
      xpReward,
      level,
      isActive,
      moduleType,
      flashcards,
      quizQuestions
    } = req.body;

    // Validation
    if (!title || !description || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and category are required'
      });
    }

    if (title.length > 100) {
      return res.status(400).json({
        success: false,
        message: 'Title must be 100 characters or less'
      });
    }

    if (description.length > 300) {
      return res.status(400).json({
        success: false,
        message: 'Description must be 300 characters or less'
      });
    }

    if (order && (order < 1 || order > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Order must be between 1 and 100'
      });
    }

    if (xpReward && (xpReward < 5 || xpReward > 100)) {
      return res.status(400).json({
        success: false,
        message: 'XP Reward must be between 5 and 100'
      });
    }

    // Check if skill with same title already exists
    const existingSkill = await Skill.findOne({ title });
    if (existingSkill) {
      return res.status(400).json({
        success: false,
        message: 'Skill with this title already exists'
      });
    }

    // Validate flashcards if provided
    if (flashcards && flashcards.length > 0) {
      for (const card of flashcards) {
        if (!card.word || !card.meaning) {
          return res.status(400).json({
            success: false,
            message: 'Each flashcard must have word and meaning'
          });
        }
        
        // Category-specific validation
        if (category === 'alphabet' || category === 'numbers') {
          if (!card.imagePath) {
            return res.status(400).json({
              success: false,
              message: 'Alphabet and numbers categories require imagePath for each flashcard'
            });
          }
        } else if (category === 'phrases') {
          if (!card.videoPath) {
            return res.status(400).json({
              success: false,
              message: 'Phrases category requires videoPath for each flashcard'
            });
          }
        } else {
          // Other categories - media is optional for partial updates
          // Only validate if both imagePath and videoPath are explicitly provided and empty
          if (card.imagePath === '' && card.videoPath === '') {
            // This is allowed for partial updates - admin can add media later
            logger.info('Flashcard "${card.word}": Media will be added later', null, 'CONTROLLER');
          }
        }
      }
    }

    // Validate quiz questions if provided
    if (quizQuestions && quizQuestions.length > 0) {
      for (const question of quizQuestions) {
        if (!question.questionType || !question.question || !question.correctAnswer || !question.options || question.options.length < 2) {
          return res.status(400).json({
            success: false,
            message: 'Each quiz question must have questionType, question, correctAnswer, and at least 2 options'
          });
        }
      }
    }

    const skill = new Skill({
      title: title.trim(),
      description: description.trim(),
      category,
      order: order || 1,
      xpReward: xpReward || 20,
      level: level || 0,
      isActive: isActive !== undefined ? isActive : true,
      moduleType: moduleType || 'flashcards',
      flashcards: flashcards || [],
      quizQuestions: quizQuestions || [],
      createdBy: req.user.id
    });

    await skill.save();

    const populatedSkill = await Skill.findById(skill._id)
      .populate('createdBy', 'name email');

    res.status(201).json({
      success: true,
      message: 'Learning module created successfully',
      data: populatedSkill
    });
  } catch (error) {
    logger.errorWithStack('Create skill error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Update skill
export const updateSkill = async (req, res) => {
  try {
    const {
      title,
      description,
      category,
      order,
      xpReward,
      level,
      isActive,
      moduleType,
      flashcards,
      quizQuestions
    } = req.body;

    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Learning module not found'
      });
    }

    // Validation for updated fields
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Title cannot be empty'
        });
      }
      if (title.length > 100) {
        return res.status(400).json({
          success: false,
          message: 'Title must be 100 characters or less'
        });
      }
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({
          success: false,
          message: 'Description cannot be empty'
        });
      }
      if (description.length > 300) {
        return res.status(400).json({
          success: false,
          message: 'Description must be 300 characters or less'
        });
      }
    }

    if (order !== undefined && (order < 1 || order > 100)) {
      return res.status(400).json({
        success: false,
        message: 'Order must be between 1 and 100'
      });
    }

    if (xpReward !== undefined && (xpReward < 5 || xpReward > 100)) {
      return res.status(400).json({
        success: false,
        message: 'XP Reward must be between 5 and 100'
      });
    }

    // Check if skill with same title already exists (excluding current skill)
    if (title && title !== skill.title) {
      const existingSkill = await Skill.findOne({ title, _id: { $ne: req.params.id } });
      if (existingSkill) {
        return res.status(400).json({
          success: false,
          message: 'Learning module with this title already exists'
        });
      }
    }

    // Validate flashcards if provided
    if (flashcards !== undefined && flashcards.length > 0) {
      for (const card of flashcards) {
        if (!card.word || !card.meaning) {
          return res.status(400).json({
            success: false,
            message: 'Each flashcard must have word and meaning'
          });
        }
        
        // Category-specific validation
        const currentCategory = category !== undefined ? category : skill.category;
        if (currentCategory === 'alphabet' || currentCategory === 'numbers') {
          if (!card.imagePath) {
            return res.status(400).json({
              success: false,
              message: 'Alphabet and numbers categories require imagePath for each flashcard'
            });
          }
        } else if (currentCategory === 'phrases') {
          if (!card.videoPath) {
            return res.status(400).json({
              success: false,
              message: 'Phrases category requires videoPath for each flashcard'
            });
          }
        } else {
          // Other categories - media is optional for partial updates
          // Only validate if both imagePath and videoPath are explicitly provided and empty
          if (card.imagePath === '' && card.videoPath === '') {
            // This is allowed for partial updates - admin can add media later
            logger.info('Flashcard "${card.word}": Media will be added later', null, 'CONTROLLER');
          }
        }
      }
    }

    // Validate quiz questions if provided
    if (quizQuestions !== undefined && quizQuestions.length > 0) {
      for (const question of quizQuestions) {
        if (!question.questionType || !question.question || !question.correctAnswer || !question.options || question.options.length < 2) {
          return res.status(400).json({
            success: false,
            message: 'Each quiz question must have questionType, question, correctAnswer, and at least 2 options'
          });
        }
      }
    }

    // Update fields (partial update - only update provided fields)
    if (title !== undefined) skill.title = title.trim();
    if (description !== undefined) skill.description = description.trim();
    if (category !== undefined) skill.category = category;
    if (order !== undefined) skill.order = order;
    if (xpReward !== undefined) skill.xpReward = xpReward;
    if (level !== undefined) skill.level = level;
    if (isActive !== undefined) skill.isActive = isActive;
    if (moduleType !== undefined) skill.moduleType = moduleType;
    if (flashcards !== undefined) skill.flashcards = flashcards;
    if (quizQuestions !== undefined) skill.quizQuestions = quizQuestions;

    await skill.save();

    const updatedSkill = await Skill.findById(skill._id)
      .populate('createdBy', 'name email')
      .populate('signs', 'word category difficulty')
      .populate('targetSign', 'word category difficulty');

    res.status(200).json({
      success: true,
      message: 'Learning module updated successfully',
      data: updatedSkill
    });
  } catch (error) {
    logger.errorWithStack('Update skill error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};

// Delete skill
export const deleteSkill = async (req, res) => {
  try {
    const skill = await Skill.findById(req.params.id);

    if (!skill) {
      return res.status(404).json({
        success: false,
        message: 'Skill not found'
      });
    }

    await Skill.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Skill deleted successfully'
    });
  } catch (error) {
    logger.errorWithStack('Delete skill error:', error, error, 'CONTROLLER');
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: error.message
    });
  }
};
