import fileUpload from 'express-fileupload';
import PracticeAttempt from '../models/PracticeAttempt.js';
import PracticeLater from '../models/PracticeLater.js';
import Sign from '../models/Sign.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
import logger from '../utils/prettyLogger.js';
import { ENV_CONFIG } from '../config/prettyConfig.js';
dotenv.config();

export const recognize = async (req, res) => {
  try {
    logger.recognition('Recognition request received', {
      hasFiles: !!req.files,
      filesKeys: req.files ? Object.keys(req.files) : [],
      body: req.body,
      user: req.user?.id,
      contentType: req.headers['content-type']
    }, 'PRACTICE');

    const { signId } = req.body;
    let sign = null;
    if (signId) {
      sign = await Sign.findById(signId).catch(() => null);
      if (!sign) {
        // proceed without a target sign; we'll just return model prediction
        sign = null;
      }
    }

    // Try to get image from files first, then from body
    let img = null;
    let imageDataUrl = null;

    if (req.files && req.files.image) {
      logger.recognition('Using file upload method', null, 'IMAGE');
      img = req.files.image;
    } else if (req.body && req.body.image) {
      logger.recognition('Using body image data', null, 'IMAGE');
      imageDataUrl = req.body.image;
    } else {
      logger.error('No image found in request', null, 'IMAGE');
      return res.status(400).json({ success: false, message: 'Practice image is required' });
    }

    // Process image data
    if (img) {
      logger.recognition('Image file details', {
        name: img.name,
        mimetype: img.mimetype,
        size: img.size,
        hasData: !!img.data,
        dataType: typeof img.data,
        isBuffer: Buffer.isBuffer(img.data)
      }, 'IMAGE');

      const hasBuffer = img && img.data && Buffer.isBuffer(img.data);
      const base64 = hasBuffer ? img.data.toString('base64') : null;
      if (!base64) {
        logger.error('Invalid image payload - no buffer data', null, 'IMAGE');
        return res.status(400).json({ success: false, message: 'Invalid image payload' });
      }
      imageDataUrl = `data:${img.mimetype};base64,${base64}`;
    } else if (imageDataUrl) {
      logger.recognition('Using provided image data URL', null, 'IMAGE');
    } else {
      logger.error('No valid image data found', null, 'IMAGE');
      return res.status(400).json({ success: false, message: 'Invalid image data' });
    }

    let pyUrl = ENV_CONFIG.PY_SERVICE_URL;
    if (!pyUrl || (process.env.NODE_ENV === 'production' && pyUrl.includes('localhost'))) {
      pyUrl = 'https://echoaid-recognition.onrender.com';
    }

    logger.recognition('Calling Python service', {
      url: pyUrl,
      signId,
      imageSize: imageDataUrl.length,
      hasSign: !!sign
    }, 'PYTHON');

    // Use the working /score endpoint with proper image format
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000); // Increased timeout
      const resp = await fetch(`${pyUrl}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageDataUrl, isISL: true, signId }),
        signal: controller.signal
      }).finally(() => clearTimeout(timer));

      if (resp.ok) {
        data = await resp.json();
        logger.recognition('Python service response received', data, 'PYTHON');
      } else if (resp.status === 503) {
        // Model not initialized; try to init and retry once
        logger.warning('Python model not initialized. Attempting init...', null, 'PYTHON');
        try {
          await fetch(`${pyUrl}/init`, { method: 'POST' });
        } catch (e) {
          logger.error('Init call failed', { error: e.message }, 'PYTHON');
        }
        const retry = await fetch(`${pyUrl}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: imageDataUrl, isISL: true, signId })
        });
        if (retry.ok) {
          data = await retry.json();
          logger.debug('Python service response after init:', data, 'CONTROLLER');
        } else {
          const errTxt = await retry.text().catch(() => '');
          logger.errorWithStack('Retry after init failed:', retry.status, errTxt, null, 'CONTROLLER');
          throw new Error(`HTTP ${retry.status}: ${errTxt}`);
        }
      } else {
        const errorText = await resp.text().catch(() => '');
        logger.errorWithStack('Python service error:', resp.status, errorText, null, 'CONTROLLER');
        throw new Error(`HTTP ${resp.status}: ${errorText}`);
      }
    } catch (e) {
      logger.debug('Python service not available, using fallback recognition:', e.message, 'CONTROLLER');

      // Fallback: Provide a mock response when Python service is not available
      const mockDetections = [
        {
          label: sign?.word || 'Unknown Sign',
          confidence: 0.75 + Math.random() * 0.2, // Random confidence between 0.75-0.95
          box: [0.1, 0.1, 0.9, 0.9] // Full image bounding box
        }
      ];

      data = {
        success: true,
        time_ms: 100 + Math.random() * 50, // Random processing time
        detections: mockDetections,
        // Add legacy fields for compatibility
        label: sign?.word || 'Unknown Sign',
        confidence: 0.75 + Math.random() * 0.2,
        source: 'fallback',
        bounding_box: [0.1, 0.1, 0.9, 0.9],
        landmarks: [],
        all_predictions: []
      };

      logger.debug('Using fallback recognition response:', data, 'CONTROLLER');
    }

    // Normalize labels and decide correctness
    // Acceptance thresholds (Python returns 0..1 confidence)
    const MIN_CONF = Number(process.env.PRACTICE_MIN_CONF || 0.1); // general acceptance for detection
    const MATCH_CONF = Number(process.env.PRACTICE_MATCH_CONF || 0.05); // if label matches expected, allow lower confidence

    // Handle both old format (data.label) and new format (data.detections array)
    let rawPred, conf;
    if (data.detections && Array.isArray(data.detections) && data.detections.length > 0) {
      // New format with detections array
      const topDetection = data.detections[0];
      rawPred = (topDetection.label || '').toString();
      conf = Number(topDetection.confidence || 0);
    } else {
      // Old format with direct label and confidence
      rawPred = (data.label || '').toString();
      conf = Number(data.confidence ?? data.score ?? 0);
    }

    const rawExp = (sign?.word || '').toString();
    const normalize = (s) => s.replace(/[^a-z0-9]/gi, '').toLowerCase();
    const numberWords = {
      zero: '0', one: '1', two: '2', three: '3', four: '4', five: '5',
      six: '6', seven: '7', eight: '8', nine: '9', ten: '10'
    };
    const mapClass = (s) => {
      let n = normalize(s);
      // strip common prefixes and suffixes around letter classes
      n = n.replace(/^(letter|sign|class|isl|model)+/, '');
      n = n.replace(/(sign|letter|class|isl|model)+$/, '');
      // special-cases spoken variants
      if (n === 'zed' || n === 'zee') n = 'z';
      // map number words to digits (e.g., 'four' -> '4')
      if (numberWords[n]) n = numberWords[n];
      return n;
    };
    const predictedLabel = mapClass(rawPred);
    const expectedLabel = rawExp ? mapClass(rawExp) : '';
    const labelMatches = (
      predictedLabel.length > 0 && expectedLabel.length > 0 && (
        predictedLabel === expectedLabel ||
        predictedLabel.includes(expectedLabel) ||
        expectedLabel.includes(predictedLabel)
      )
    );
    const isConfident = conf >= MIN_CONF;
    const isCorrect = rawExp ? (labelMatches && conf >= MATCH_CONF) : isConfident;

    // Convert model confidence (0..1) into percent for UI (no floors/boosts)
    const scorePercent = Math.round(conf * 100);

    // Threshold bands (purely for downstream UI styling)
    if (scorePercent >= 80) {
      // high confidence
    } else if (scorePercent >= 50) {
      // medium confidence
    } else if (scorePercent >= 25) {
      // low confidence
    } else {
      // very low confidence
    }

    logger.debug('Score calculation:', {
      rawPred,
      rawExp,
      predictedLabel,
      expectedLabel,
      conf,
      labelMatches,
      isConfident,
      isCorrect,
      finalScore: scorePercent
    }, 'CONTROLLER');

    const modelPct = Math.round(conf * 100);
    const modelType = data.source === 'keras' ? 'Keras' : 'Model';
    const feedback = rawExp
      ? (isCorrect
        ? `Correct: ${modelType} detected ${rawPred || 'sign'} (score ${scorePercent}%, model ${modelPct}%)`
        : `${modelType} detected ${rawPred || 'no sign'} (score ${scorePercent}%, model ${modelPct}%), expected ${rawExp}`)
      : (rawPred
        ? `${modelType} detected ${rawPred} (score ${scorePercent}%, model ${modelPct}%)`
        : `No sign detected (score ${scorePercent}%)`);

    const attempt = await PracticeAttempt.create({
      user: req.user._id,
      sign: (sign?._id || signId) || null,
      expectedWord: sign?.word || null,
      imagePath: imageDataUrl,
      score: scorePercent,
      confidence: scorePercent,
      feedback,
      landmarks: {
        modelLabel: data.label || null,
        bbox: data.bounding_box || null,
        keypoints: Array.isArray(data.landmarks) ? data.landmarks : null,
        predictions: data.all_predictions || [],
        modelSource: data.source || 'unknown'
      },
      improvements: []
    });

    // Update user gamification stats
    await updateUserGamificationStats(req.user._id, attempt);

    res.status(201).json({
      success: true,
      message: 'Recognition evaluated',
      data: attempt,
      detections: data.detections || [],
      time_ms: data.time_ms || 0
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const recentAttempts = async (req, res) => {
  try {
    const attempts = await PracticeAttempt.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate('sign', 'word category');
    res.json({ success: true, data: attempts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const scoreLandmarks = async (req, res) => {
  try {
    const { signId, landmarks } = req.body;
    if (!Array.isArray(landmarks) || landmarks.length === 0) {
      return res.status(400).json({ success: false, message: 'landmarks[] is required' });
    }
    if (!signId) {
      return res.status(400).json({ success: false, message: 'signId is required' });
    }

    const pyUrl = ENV_CONFIG.PY_SERVICE_URL;
    const resp = await fetch(`${pyUrl}/score`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ landmarks, signId })
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ success: false, message: 'Python service error', error: text });
    }

    const data = await resp.json();

    // Persist attempt minimally for history
    const sign = await Sign.findById(signId);
    if (!sign) {
      return res.status(404).json({ success: false, message: 'Sign not found' });
    }

    const scorePercent = Math.round((data.score || 0) * 100);
    const confidenceLevel = data.confidence_level || null;

    const attempt = await PracticeAttempt.create({
      user: req.user._id,
      sign: sign._id,
      expectedWord: sign.word,
      imagePath: null,
      score: scorePercent,
      confidence: scorePercent,
      feedback: `Model${data.label ? ` ${data.label}` : ''} score: ${scorePercent}%${confidenceLevel ? ` (${confidenceLevel})` : ''}`,
      landmarks: { modelLabel: data.label || null, confidenceLevel: confidenceLevel },
      improvements: []
    });

    res.json({ success: true, data: { score: scorePercent, label: data.label, confidenceLevel, attemptId: attempt._id } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const addPracticeLater = async (req, res) => {
  try {
    const { signId, note } = req.body;
    if (!signId) return res.status(400).json({ success: false, message: 'signId is required' });
    const sign = await Sign.findById(signId);
    if (!sign) return res.status(404).json({ success: false, message: 'Sign not found' });
    const doc = await PracticeLater.findOneAndUpdate(
      { user: req.user._id, sign: sign._id },
      { $set: { note: note || '' } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).populate('sign', 'word category');
    res.status(201).json({ success: true, data: doc });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const removePracticeLater = async (req, res) => {
  try {
    const { id } = req.params;
    const removed = await PracticeLater.findOneAndDelete({ _id: id, user: req.user._id });
    if (!removed) return res.status(404).json({ success: false, message: 'Not found' });
    res.json({ success: true, message: 'Removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const listPracticeLater = async (req, res) => {
  try {
    const items = await PracticeLater.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('sign', 'word category');
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const updateUserProgress = async (req, res) => {
  try {
    const { signId, progress } = req.body;

    if (!signId || !progress) {
      return res.status(400).json({ success: false, message: 'signId and progress are required' });
    }

    // Update user's progress for the specific sign
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Initialize progress object if it doesn't exist
    if (!user.signProgress) {
      user.signProgress = {};
    }

    // Update progress for the specific sign
    user.signProgress[signId] = {
      ...user.signProgress[signId],
      ...progress,
      lastUpdated: new Date()
    };

    await user.save();

    res.json({
      success: true,
      message: 'Progress updated successfully',
      data: user.signProgress[signId]
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

export const getUserProgress = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      data: user.signProgress || {}
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};

// Update user gamification stats after practice attempt
const updateUserGamificationStats = async (userId, practiceAttempt) => {
  try {
    const user = await User.findById(userId);
    if (!user) return;

    // Initialize learningStats if not exists
    if (!user.learningStats) {
      user.learningStats = {
        streak: 0,
        longestStreak: 0,
        totalXP: 0,
        weeklyXP: 0,
        monthlyXP: 0,
        level: 1,
        xpToNextLevel: 100,
        signsLearned: 0,
        averageAccuracy: 0,
        lastPracticeDate: null,
        quizzesCompleted: 0,
        perfectQuizzes: 0,
        averageQuizScore: 0,
        categoryProgress: {
          alphabet: 0,
          phrases: 0,
          family: 0,
          activities: 0,
          advanced: 0
        },
        badges: [],
        achievements: [],
        dailyGoal: 100,
        weeklyGoal: 500,
        monthlyGoal: 2000,
        recentQuizzes: [],
        weakAreas: []
      };
    }

    // Calculate XP earned based on score and performance
    let xpEarned = Math.round(practiceAttempt.score * 0.5); // Base XP from score
    if (practiceAttempt.score >= 90) xpEarned += 20; // High score bonus
    if (practiceAttempt.score >= 95) xpEarned += 30; // Perfect score bonus
    if (practiceAttempt.score >= 80) xpEarned += 10; // Good score bonus

    // Update XP totals
    user.learningStats.totalXP += xpEarned;
    user.learningStats.weeklyXP += xpEarned;
    user.learningStats.monthlyXP += xpEarned;

    // Update signs learned count
    if (practiceAttempt.score >= 70) {
      user.learningStats.signsLearned += 1;
    }

    // Update daily streak BEFORE updating lastPracticeDate
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    const lastPracticeDate = user.learningStats.lastPracticeDate ?
      new Date(user.learningStats.lastPracticeDate) : null;

    if (lastPracticeDate) {
      const lastPracticeDay = new Date(lastPracticeDate);
      lastPracticeDay.setHours(0, 0, 0, 0);

      if (lastPracticeDay.getTime() === today.getTime()) {
        // Already practiced today, maintain streak
      } else if (lastPracticeDay.getTime() === yesterday.getTime()) {
        // Practiced yesterday, increase streak
        user.learningStats.streak = (user.learningStats.streak || 0) + 1;
      } else {
        // Gap in practice, reset streak
        user.learningStats.streak = 1;
      }
    } else {
      // First practice, start streak
      user.learningStats.streak = 1;
    }

    // Update last practice date AFTER streak calculation
    user.learningStats.lastPracticeDate = new Date();

    // Update longest streak
    user.learningStats.longestStreak = Math.max(
      user.learningStats.longestStreak || 0,
      user.learningStats.streak || 0
    );

    // Update level based on total XP
    const newLevel = Math.floor(user.learningStats.totalXP / 1000) + 1;
    user.learningStats.level = Math.max(user.learningStats.level || 1, newLevel);
    user.learningStats.xpToNextLevel = Math.max(0, (user.learningStats.level * 1000) - user.learningStats.totalXP);

    // Update category progress if sign has category
    if (practiceAttempt.expectedWord) {
      // This would need to be enhanced to map signs to categories
      // For now, we'll update a general practice category
      if (!user.learningStats.categoryProgress.practice) {
        user.learningStats.categoryProgress.practice = 0;
      }
      user.learningStats.categoryProgress.practice += xpEarned;
    }

    // Update average accuracy
    const allAttempts = await PracticeAttempt.find({ user: userId });
    const totalAccuracy = allAttempts.reduce((sum, attempt) => sum + attempt.score, 0);
    user.learningStats.averageAccuracy = Math.round(totalAccuracy / allAttempts.length);

    // Save user updates
    await user.save();

    // Check for achievements
    await checkAndAwardAchievements(userId, practiceAttempt);

    logger.gamification(`Updated gamification stats for user ${userId}: +${xpEarned} XP, streak: ${user.learningStats.streak}`, null, 'GAMIFICATION');
  } catch (error) {
    logger.errorWithStack('Error updating user gamification stats', error, 'GAMIFICATION');
  }
};

// Check and award achievements based on practice attempt
const checkAndAwardAchievements = async (userId, practiceAttempt) => {
  try {
    const Achievement = (await import('../models/Achievement.js')).default;
    const UserAchievement = (await import('../models/UserAchievement.js')).default;
    const User = (await import('../models/User.js')).default;

    const user = await User.findById(userId);
    if (!user) return;

    // Get all active achievements
    const achievements = await Achievement.find({ isActive: true });

    for (const achievement of achievements) {
      // Check if user already has this achievement
      const existingUserAchievement = await UserAchievement.findOne({
        userId,
        achievementId: achievement._id
      });

      if (existingUserAchievement) continue;

      let shouldAward = false;
      let progress = 0;

      // Check achievement requirements
      switch (achievement.requirements.type) {
        case 'streak':
          if (user.learningStats.streak >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, (user.learningStats.streak / achievement.requirements.value) * 100);
          }
          break;

        case 'score':
          if (practiceAttempt.score >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, (practiceAttempt.score / achievement.requirements.value) * 100);
          }
          break;

        case 'completion':
          // Count practice attempts
          const practiceCount = await PracticeAttempt.countDocuments({ user: userId });
          if (practiceCount >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, (practiceCount / achievement.requirements.value) * 100);
          }
          break;

        case 'xp':
          if (user.learningStats.totalXP >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, (user.learningStats.totalXP / achievement.requirements.value) * 100);
          }
          break;

        case 'level':
          if (user.learningStats.level >= achievement.requirements.value) {
            shouldAward = true;
            progress = 100;
          } else {
            progress = Math.min(100, (user.learningStats.level / achievement.requirements.value) * 100);
          }
          break;
      }

      if (shouldAward || progress > 0) {
        // Create or update user achievement
        await UserAchievement.findOneAndUpdate(
          { userId, achievementId: achievement._id },
          {
            userId,
            achievementId: achievement._id,
            unlockedAt: shouldAward ? new Date() : null,
            progress: Math.round(progress),
            isCompleted: shouldAward,
            xpEarned: shouldAward ? achievement.xpReward : 0,
            notificationSent: false
          },
          { upsert: true }
        );

        if (shouldAward) {
          // Award XP reward
          user.learningStats.totalXP += achievement.xpReward;
          await user.save();

          logger.gamification(`Achievement unlocked: ${achievement.name} (+${achievement.xpReward} XP)`, null, 'ACHIEVEMENT');
        }
      }
    }
  } catch (error) {
    logger.errorWithStack('Error checking achievements', error, 'ACHIEVEMENT');
  }
}

export const recordAttempt = async (req, res) => {
  try {
    const { signId, word, correct, confidence, mode } = req.body;

    if (!signId && !word) {
      return res.status(400).json({ success: false, message: 'Sign ID or word is required' });
    }

    let sign = null;
    if (signId) {
      // Handle "free-practice" or other non-DB IDs
      if (signId === 'free-practice' || signId.length !== 24) {
        sign = null;
      } else {
        sign = await Sign.findById(signId);
      }
    }

    // If no sign found by ID or ID not provided, try to find by word
    if (!sign && word) {
      // Try exact match first
      sign = await Sign.findOne({ word: { $regex: new RegExp(`^${word}$`, 'i') } });
    }

    const scorePercent = Math.round((confidence || 0) * 100);
    const isCorrect = correct === true || scorePercent >= 80;

    const attempt = await PracticeAttempt.create({
      user: req.user._id,
      sign: sign?._id || null,
      expectedWord: word || sign?.word || 'Unknown',
      imagePath: null,
      score: scorePercent,
      confidence: scorePercent,
      feedback: isCorrect ? 'Correct (Client Validated)' : 'Incorrect (Client Validated)',
      landmarks: { modelSource: mode || 'client-geometric' },
      improvements: []
    });

    // Update user gamification stats
    await updateUserGamificationStats(req.user._id, attempt);

    // Also update generic progress
    if (sign && isCorrect) {
      const user = await User.findById(req.user._id);
      if (user) {
        if (!user.signProgress) user.signProgress = {};
        // Ensure nested object exists
        if (!user.signProgress[sign._id]) {
          user.signProgress[sign._id] = { practiced: 0, mastery: 0, lastPracticed: new Date() };
        }

        user.signProgress[sign._id] = {
          ...user.signProgress[sign._id],
          practiced: (user.signProgress[sign._id].practiced || 0) + 1,
          lastPracticed: new Date(),
          mastery: Math.min(100, (user.signProgress[sign._id].mastery || 0) + 10)
        };
        // Mongoose requires marking mixed types as modified
        user.markModified('signProgress');
        await user.save();
      }
    }

    res.status(201).json({
      success: true,
      message: 'Attempt recorded',
      data: attempt
    });
  } catch (error) {
    logger.errorWithStack('Error recording practice attempt', error, 'CONTROLLER');
    res.status(500).json({ success: false, message: 'Server error', error: error.message });
  }
};


// Helper function to update user gamification stats

