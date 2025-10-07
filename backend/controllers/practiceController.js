import fileUpload from 'express-fileupload';
import PracticeAttempt from '../models/PracticeAttempt.js';
import PracticeLater from '../models/PracticeLater.js';
import Sign from '../models/Sign.js';
import User from '../models/User.js';
import dotenv from 'dotenv';
dotenv.config();

// Enhanced scoring function with ML-like feedback
function computeSignRecognitionScore(imageData, targetSign) {
  // Simulate ML processing with more realistic scoring
  const baseScore = Math.floor(60 + Math.random() * 40); // 60-100
  
  // Add some variation based on sign complexity
  const complexityFactor = targetSign.category === 'advanced' ? 0.9 : 1.0;
  const finalScore = Math.round(baseScore * complexityFactor);
  
  return {
    score: finalScore,
    confidence: Math.min(finalScore + Math.random() * 10, 100),
    feedback: generateDetailedFeedback(finalScore, targetSign),
    landmarks: generateLandmarkAnalysis(),
    improvements: generateImprovementSuggestions(finalScore, targetSign)
  };
}

function generateDetailedFeedback(score, targetSign) {
  if (score >= 90) {
    return `Excellent! Your sign for "${targetSign.word}" is very accurate. Great job!`;
  } else if (score >= 80) {
    return `Good job! Your sign for "${targetSign.word}" is mostly correct with minor adjustments needed.`;
  } else if (score >= 70) {
    return `Getting there! Your sign for "${targetSign.word}" needs some improvements in form and position.`;
  } else if (score >= 60) {
    return `Keep practicing! Your sign for "${targetSign.word}" needs significant improvement.`;
  } else {
    return `Don't give up! Your sign for "${targetSign.word}" needs more practice. Focus on the basics.`;
  }
}

function generateLandmarkAnalysis() {
  return {
    handShape: Math.random() > 0.3 ? 'correct' : 'needs_adjustment',
    position: Math.random() > 0.4 ? 'correct' : 'needs_adjustment',
    orientation: Math.random() > 0.5 ? 'correct' : 'needs_adjustment',
    movement: Math.random() > 0.6 ? 'correct' : 'needs_adjustment',
    timing: Math.random() > 0.7 ? 'correct' : 'needs_adjustment'
  };
}

function generateImprovementSuggestions(score, targetSign) {
  const suggestions = [];
  
  if (score < 80) {
    suggestions.push('Focus on making your hand shape more precise');
  }
  if (score < 70) {
    suggestions.push('Check your hand position relative to your body');
  }
  if (score < 60) {
    suggestions.push('Work on the movement pattern and flow of the sign');
  }
  if (score < 50) {
    suggestions.push('Practice the basic hand shape first before adding movement');
  }
  
  return suggestions;
}

// Simple stub scoring function (replace with real model later)
function computeStubScore() {
  return Math.floor(60 + Math.random() * 40); // 60-100
}

export const recognize = async (req, res) => {
  try {
    const { signId } = req.body;
    let sign = null;
    if (signId) {
      sign = await Sign.findById(signId).catch(() => null);
      if (!sign) {
        // proceed without a target sign; we'll just return model prediction
        sign = null;
      }
    }

    if (!req.files || !req.files.image) {
      return res.status(400).json({ success: false, message: 'Practice image is required' });
    }

    // Build payload and call Python recognition service
    const img = req.files.image;
    const hasBuffer = img && img.data && Buffer.isBuffer(img.data);
    const base64 = hasBuffer ? img.data.toString('base64') : null;
    if (!base64) {
      return res.status(400).json({ success: false, message: 'Invalid image payload' });
    }

    const imageDataUrl = `data:${img.mimetype};base64,${base64}`;

    const pyUrl = process.env.PY_SERVICE_URL || 'http://localhost:8001';
    let data;
    
    console.log('Calling Python service:', {
      url: pyUrl,
      signId,
      imageSize: base64.length,
      hasSign: !!sign
    });
    
    // Prefer direct base64 -> /score
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000); // Increased timeout
      const resp = await fetch(`${pyUrl}/score`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64, isISL: true, signId }),
        signal: controller.signal
      }).finally(() => clearTimeout(timer));
      
      if (resp.ok) {
        data = await resp.json();
        console.log('Python service response:', data);
      } else if (resp.status === 503) {
        // Model not initialized; try to init and retry once
        console.warn('Python model not initialized. Attempting init...');
        try {
          await fetch(`${pyUrl}/init`, { method: 'POST' });
        } catch (e) {
          console.error('Init call failed:', e.message);
        }
        const retry = await fetch(`${pyUrl}/score`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: base64, isISL: true, signId })
        });
        if (retry.ok) {
          data = await retry.json();
          console.log('Python service response after init:', data);
        } else {
          const errTxt = await retry.text().catch(() => '');
          console.error('Retry after init failed:', retry.status, errTxt);
          throw new Error(`HTTP ${retry.status}: ${errTxt}`);
        }
      } else {
        const errorText = await resp.text().catch(() => '');
        console.error('Python service error:', resp.status, errorText);
        throw new Error(`HTTP ${resp.status}: ${errorText}`);
      }
    } catch (e) {
      console.log('Base64 method failed, trying multipart fallback:', e.message);
      // Fallback: send multipart to /score_upload (some envs handle files better)
      try {
        const form = new FormData();
        const blob = new Blob([img.data], { type: img.mimetype || 'image/jpeg' });
        form.append('file', blob, img.name || 'image.jpg');
        let resp2 = await fetch(`${pyUrl}/score_upload?signId=${encodeURIComponent(signId || '')}`, {
          method: 'POST',
          body: form
        });
        if (resp2.status === 503) {
          // Try init then retry once
          try { await fetch(`${pyUrl}/init`, { method: 'POST' }); } catch {}
          resp2 = await fetch(`${pyUrl}/score_upload?signId=${encodeURIComponent(signId || '')}`, {
            method: 'POST',
            body: form
          });
        }
        if (!resp2.ok) {
          const text = await resp2.text().catch(() => '');
          console.error('Multipart fallback failed:', resp2.status, text);
          return res.status(502).json({ success: false, message: 'Python service error', error: text || `HTTP ${resp2.status}` });
        }
        data = await resp2.json();
        console.log('Multipart fallback response:', data);
      } catch (err) {
        console.error('Both methods failed:', err);
        return res.status(502).json({ success: false, message: 'Python service error', error: err.message || 'fetch failed' });
      }
    }

    // Normalization + mapping to avoid false positives due to naming
    // Acceptance thresholds
    const MIN_CONF = Number(process.env.PRACTICE_MIN_CONF || 0.1); // general acceptance for detection
    const MATCH_CONF = Number(process.env.PRACTICE_MATCH_CONF || 0.05); // if label matches expected, allow lower confidence
    const rawPred = (data.label || '').toString();
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
    const conf = Number(data.confidence ?? data.score ?? 0);
    const labelMatches = (
      predictedLabel.length > 0 && expectedLabel.length > 0 && (
        predictedLabel === expectedLabel ||
        predictedLabel.includes(expectedLabel) ||
        expectedLabel.includes(predictedLabel)
      )
    );
    const isConfident = conf >= MIN_CONF;
    const isCorrect = rawExp ? (labelMatches && conf >= MATCH_CONF) : isConfident;

    // YOLO-specific score calculation
    let scorePercent = Math.round(conf * 100);
    
    // YOLO returns confidence scores directly, so use them as-is
    // If YOLO detected something but confidence is very low, give minimum score
    if (scorePercent > 0 && scorePercent < 10) {
      scorePercent = Math.max(scorePercent, 15); // Minimum 15% for any YOLO detection
    }
    
    // If YOLO detected nothing (no bounding boxes), give very low score
    if (scorePercent === 0) {
      scorePercent = Math.floor(Math.random() * 10) + 5; // 5-15% for no YOLO detection
    }
    
    // Boost score if YOLO prediction matches expected sign
    if (labelMatches && rawExp) {
      scorePercent = Math.min(scorePercent + 15, 100); // Smaller boost for YOLO
    }
    
    // YOLO confidence thresholds for ISL signs
    if (scorePercent >= 80) {
      // High confidence YOLO detection
    } else if (scorePercent >= 50) {
      // Medium confidence YOLO detection  
    } else if (scorePercent >= 25) {
      // Low confidence YOLO detection
    } else {
      // Very low or no YOLO detection
    }
    
    console.log('Score calculation:', {
      rawPred,
      rawExp,
      predictedLabel,
      expectedLabel,
      conf,
      labelMatches,
      isConfident,
      isCorrect,
      finalScore: scorePercent
    });

    const modelPct = Math.round(conf * 100);
    const modelType = data.source === 'keras' ? 'Keras' : data.source === 'yolo' ? 'YOLO' : 'Model';
    const feedback = rawExp
      ? (isCorrect
          ? `Correct: ${modelType} detected ${rawPred || 'sign'} (score ${scorePercent}%, model ${modelPct}%)`
          : `${modelType} detected ${rawPred || 'no sign'} (score ${scorePercent}%, model ${modelPct}%), expected ${rawExp}`)
      : (rawPred
          ? `${modelType} detected ${rawPred} (score ${scorePercent}%, model ${modelPct}%)`
          : `No sign detected (score ${scorePercent}%)`);

    const attempt = await PracticeAttempt.create({
      user: req.user._id,
      sign: (sign?._id || signId),
      expectedWord: sign?.word || null,
      imagePath: imageDataUrl,
      score: scorePercent,
      confidence: scorePercent,
      feedback,
      landmarks: { 
        modelLabel: data.label || null, 
        bbox: data.bounding_box || null,
        predictions: data.all_predictions || [],
        modelSource: data.source || 'unknown'
      },
      improvements: []
    });

    res.status(201).json({ success: true, message: 'Recognition evaluated', data: attempt });
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

    const pyUrl = process.env.PY_SERVICE_URL || 'http://localhost:8001';
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

