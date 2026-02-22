import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Conversation from '../models/Conversation.js';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';
const GEMINI_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
const HUGGINGFACE_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';
const OLLAMA_URL = 'http://localhost:11434/api/generate';

export const aiCoachLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

// Lazy-load and cache the corrected teaching guide
let TEACHING_CACHE = null;
function loadTeachingGuide() {
  // In development, reload file on every request for easier testing
  if (process.env.NODE_ENV === 'development') {
    TEACHING_CACHE = null;
  }

  if (TEACHING_CACHE) return TEACHING_CACHE;
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const guidePath = path.join(__dirname, '..', '..', 'CORRECTED_CHATBOT_TEACHING.md');
    const text = fs.readFileSync(guidePath, 'utf8');
    TEACHING_CACHE = text;
  } catch (err) {
    console.error('Error loading teaching guide:', err);
    TEACHING_CACHE = null;
  }
  return TEACHING_CACHE;
}

// ... extractSignSection ...

function buildSystemPrompt(alignmentOnly = false) {
  const base = [
    'You are an AI assistant for the EchoAid app. Primary domain: ISL (A–Z, 0–9).',
    'Follow these "Golden Coaching Rules":',
    '1. DOMINANT HAND RULE: Remind users to keep the non-dominant hand steady as a base.',
    '2. LIGHTING: If users report detection issues, suggest front-facing light and plain backgrounds.',
    '3. STABILITY: Suggest resting elbows on a table to reduce jitter.',
    '4. TONE: Be encouraging but technical (e.g., "Good alignment on the finger loops").',
    '',
    'Absolute rules:',
    '- Prefer authoritative sign info from the provided context.',
    '- Keep answers concise (<= 100 words).',
  ];
  if (alignmentOnly) {
    base.push(
      'Output ONLY step-by-step HAND ALIGNMENT and POSITIONING guidance.',
      'Structure strictly:',
      '  1) Alignment steps (3–6 bullets)',
      '  2) Common mistakes (<= 3 bullets)',
      '  3) Pro tips (<= 2 bullets)'
    );
  } else {
    base.push(
      'When the question is about signs, focus on alignment/position/orientation; otherwise, answer the general question clearly.'
    );
  }
  return base.join('\n');
}

function sanitize(text = '') {
  if (!text) return '';
  // simple length cap and strip overly long content
  return String(text).slice(0, 1200);
}

// Get or create conversation
async function getOrCreateConversation(userId, sessionId, aiProvider) {
  try {
    return await Conversation.findOrCreate(userId, sessionId, aiProvider);
  } catch (error) {
    console.error('[AI] Error getting conversation:', error);
    return null;
  }
}

// Save conversation messages
async function saveConversationMessages(sessionId, userMessage, assistantMessage, metadata = {}) {
  try {
    const conversation = await Conversation.findOne({ sessionId });
    if (!conversation) return;

    await conversation.addMessage('user', userMessage, metadata);
    await conversation.addMessage('assistant', assistantMessage, metadata);
  } catch (error) {
    console.error('[AI] Error saving messages:', error);
  }
}

// Call AI provider (supports FREE options: Gemini, Hugging Face, Ollama)
async function callAIProvider(provider, apiKey, model, messages) {
  // FREE: Google Gemini
  if (provider === 'gemini') {
    const prompt = messages
      .filter(m => m.role !== 'system')
      .map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`)
      .join('\n\n');

    // Use specific model URL if needed, or default constant
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 500
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    return {
      choices: [{
        message: {
          content: data.candidates?.[0]?.content?.parts?.[0]?.text || "I'm having trouble thinking right now."
        }
      }]
    };
  }

  // FREE: Hugging Face Inference API
  if (provider === 'huggingface') {
    const prompt = messages.map(m => m.content).join('\n\n');

    const response = await fetch(HUGGINGFACE_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 500,
          temperature: 0.7,
          return_full_text: false
        }
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Hugging Face API error: ${response.status} - ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    return {
      choices: [{
        message: {
          content: data[0].generated_text || data[0].text || JSON.stringify(data)
        }
      }]
    };
  }

  // FREE: Ollama (Local)
  if (provider === 'ollama') {
    const prompt = messages.map(m => m.content).join('\n\n');

    const response = await fetch(OLLAMA_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: model || 'llama2',
        prompt: prompt,
        stream: false
      })
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Ollama error: ${response.status} - ${text.slice(0, 200)}`);
    }

    const data = await response.json();
    return {
      choices: [{
        message: {
          content: data.response
        }
      }]
    };
  }

  // PAID: OpenAI or OpenRouter
  const url = provider === 'openai' ? OPENAI_URL : OPENROUTER_URL;

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`
  };

  if (provider !== 'openai') {
    headers['HTTP-Referer'] = process.env.FRONTEND_URL || 'http://localhost:5173';
    headers['X-Title'] = 'EchoAid AI Coach';
  }

  const payload = {
    model,
    messages,
    temperature: provider === 'openai' ? 0.7 : 0.4,
    max_tokens: provider === 'openai' ? 500 : 300
  };

  const response = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`AI provider error: ${response.status} - ${text.slice(0, 200)}`);
  }

  return await response.json();
}

export async function aiCoach(req, res) {
  try {
    if (process.env.AI_COACH_ENABLED !== 'true') {
      return res.status(503).json({ success: false, message: 'AI Coach disabled' });
    }

    // Support multiple providers (FREE and PAID)
    const provider = process.env.AI_PROVIDER || 'gemini'; // Default to FREE Gemini
    let apiKey, model;

    // FREE OPTIONS
    if (provider === 'gemini') {
      apiKey = process.env.GEMINI_API_KEY;
      model = 'gemini-1.5-flash';
    } else if (provider === 'huggingface') {
      apiKey = process.env.HUGGINGFACE_API_KEY;
      model = 'mistralai/Mistral-7B-Instruct-v0.2';
    } else if (provider === 'ollama') {
      apiKey = null; // Local, no key needed
      model = process.env.OLLAMA_MODEL || 'llama2';
    }
    // PAID OPTIONS
    else if (provider === 'openai') {
      apiKey = process.env.OPENAI_API_KEY;
      model = process.env.OPENAI_MODEL || 'gpt-4-turbo-preview';
    } else {
      // OpenRouter/DeepSeek
      apiKey = process.env.DEEPSEEK_API_KEY;
      model = process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat';
    }

    if (!apiKey && provider !== 'ollama') {
      return res.status(500).json({
        success: false,
        message: `Missing API key for provider: ${provider}. Get free key at: https://makersuite.google.com/app/apikey`
      });
    }

    const { question, detectedSign, expected, level, contextSignInfo, alignmentOnly = false, signKey, sessionId } = req.body || {};

    // Get or create conversation for context
    const userId = req.user?.id || null;
    const conversationSessionId = sessionId || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const conversation = await getOrCreateConversation(userId, conversationSessionId, provider);

    const userPromptParts = [];
    if (question) userPromptParts.push(`User question: ${sanitize(question)}`);

    const qLower2 = (question || '').toLowerCase();
    const sentenceIntent = /\b(sentence|form\s+sentences|grammar|make\s+a?\s*sentence|word\s*order)\b/.test(qLower2);

    if (!sentenceIntent) {
      if (detectedSign?.label) {
        userPromptParts.push(`Detected sign: ${sanitize(detectedSign.label)} (confidence: ${detectedSign.confidence ?? 'n/a'}%)`);

        // --- INJECT GEOMETRIC FEEDBACK ---
        if (detectedSign.improvements && Array.isArray(detectedSign.improvements) && detectedSign.improvements.length > 0) {
          const failures = detectedSign.improvements.filter(i => !i.toLowerCase().includes('perfect'));
          if (failures.length > 0) {
            userPromptParts.push('CRITICAL REAL-TIME FEEDBACK (The user is making these specific geometric errors right now):');
            failures.forEach(fail => userPromptParts.push(`- ISSUE: ${sanitize(fail)}`));
            userPromptParts.push('INSTRUCTION: Address these specific errors first. Explain physically how to correct them based on the ISL rules.');
          }
        }
      }
      if (expected) userPromptParts.push(`Practicing target: ${sanitize(expected)}`);
      if (level) userPromptParts.push(`Learner level: ${sanitize(level)}`);
      if (contextSignInfo) {
        const d = contextSignInfo;
        userPromptParts.push('Provided sign info (authoritative):');
        if (d.description) userPromptParts.push(`- Description: ${sanitize(d.description)}`);
        if (d.tips?.length) userPromptParts.push(`- Tips: ${sanitize(d.tips.join('; '))}`);
        if (d.commonMistakes?.length) userPromptParts.push(`- Common mistakes: ${sanitize(d.commonMistakes.join('; '))}`);
      }
    } else {
      userPromptParts.push('Focus on: how ISL signs/letters form sentences (fingerspelling, word order such as SOV/topic-first, non-manual markers, concise example).');
    }

    // Only inject teaching section when the intent is about signs/alignment
    const isAlignmentIntent = /\b(sign|alignment|align|hand|position|orientation|steps|how to|make|form|mistake|tips)\b/i.test(question || '');
    const guide = loadTeachingGuide();
    const section = (!sentenceIntent && isAlignmentIntent) ? extractSignSection(guide, signKey || detectedSign?.label || expected || '') : '';
    if (!sentenceIntent && isAlignmentIntent && section) {
      userPromptParts.push('Authoritative alignment section (use this as ground truth, do not contradict):');
      userPromptParts.push(sanitize(section));
    }

    // Intent hinting for better relevance (e.g., sentence formation)
    const intentHints = [];
    if (sentenceIntent) {
      intentHints.push('User intent: Explain how ISL signs/letters form sentences. Cover: when to fingerspell (names/unknown words), basic word order (common SOV/topic-first), non-manual markers (facial expressions), and give one short example. Keep concise.');
    }

    // Get conversation history for context (last 10 messages)
    const conversationHistory = conversation ? conversation.getRecentMessages(10) : [];

    const messages = [
      { role: 'system', content: buildSystemPrompt(Boolean(alignmentOnly)) },
      ...conversationHistory, // Include previous conversation
      { role: 'user', content: [userPromptParts.join('\n') || 'Teach how to form the current ISL sign.', ...intentHints].filter(Boolean).join('\n') }
    ];

    // Call AI provider
    const data = await callAIProvider(provider, apiKey, model, messages);
    const content = data?.choices?.[0]?.message?.content || '';

    // Save conversation
    if (conversation) {
      await saveConversationMessages(
        conversationSessionId,
        question || 'Teach how to form the current ISL sign.',
        content,
        {
          detectedSign: detectedSign?.label,
          confidence: detectedSign?.confidence,
          signKey: signKey || detectedSign?.label,
          learningLevel: level
        }
      );
    }
    return res.json({
      success: true,
      content: sanitize(content),
      sessionId: conversationSessionId,
      provider: provider
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}
