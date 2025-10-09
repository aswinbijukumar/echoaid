import rateLimit from 'express-rate-limit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const OPENROUTER_URL = 'https://openrouter.ai/api/v1/chat/completions';

export const aiCoachLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false
});

// Lazy-load and cache the corrected teaching guide
let TEACHING_CACHE = null;
function loadTeachingGuide() {
  if (TEACHING_CACHE) return TEACHING_CACHE;
  try {
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    const guidePath = path.join(__dirname, '..', '..', 'CORRECTED_CHATBOT_TEACHING.md');
    const text = fs.readFileSync(guidePath, 'utf8');
    TEACHING_CACHE = text;
  } catch {
    TEACHING_CACHE = null;
  }
  return TEACHING_CACHE;
}

function extractSignSection(guide, signKey) {
  if (!guide || !signKey) return '';
  const key = String(signKey).trim().toUpperCase();
  // Matches headings like: #### **Letter A** or numbers section like Number 3
  const patterns = [
    new RegExp(`^#### \*\*Letter ${key}\*\*\s*[\s\S]*?(?=^#### |^## |\
+\Z)`, 'm'),
    new RegExp(`^#### \*\*Number ${key}\*\*\s*[\s\S]*?(?=^#### |^## |\
+\Z)`, 'm')
  ];
  for (const re of patterns) {
    const m = guide.match(re);
    if (m) return m[0].slice(0, 1200);
  }
  return '';
}

function buildSystemPrompt(alignmentOnly = false) {
  const base = [
    'You are an AI assistant for the EchoAid app. Primary domain: ISL (A–Z, 0–9), but you may answer general user questions when asked.',
    'Absolute rules:',
    '- Prefer user-provided sign info (description, tips, mistakes) over any prior knowledge.',
    '- If unsure or missing info, say you are unsure. Do not invent.',
    '- Keep answers concise (<= 100 words).',
    '- Refuse unrelated topics.',
  ];
  if (alignmentOnly) {
    base.push(
      'Output ONLY step-by-step HAND ALIGNMENT and POSITIONING guidance for forming the sign. No history, no definitions, no long explanations.',
      'Structure strictly:',
      '  1) Alignment steps (bullet list, 3–6 bullets)',
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

export async function aiCoach(req, res) {
  try {
    if (process.env.AI_COACH_ENABLED !== 'true') {
      return res.status(503).json({ success: false, message: 'AI Coach disabled' });
    }

    const provider = process.env.DEEPSEEK_PROVIDER || 'openrouter';
    const apiKey = process.env.DEEPSEEK_API_KEY;
    const model = process.env.DEEPSEEK_MODEL || 'deepseek/deepseek-chat';
    if (!apiKey) {
      return res.status(500).json({ success: false, message: 'Missing AI API key' });
    }

    const { question, detectedSign, expected, level, contextSignInfo, alignmentOnly = false, signKey } = req.body || {};

    // Fast path: respond to simple greetings without calling provider (helps connectivity checks)
    const q = (question || '').trim().toLowerCase();
    const greetingSet = new Set(['hi', 'hello', 'hey', 'yo', 'hai']);
    const smallTalkPhrases = [
      'how are you', 'how r u', "what's up", 'whats up', 'how is it going', 'who are you', 'tell me about yourself'
    ];
    const isGreeting = greetingSet.has(q);
    const isSmallTalk = smallTalkPhrases.some(p => q.includes(p));
    if (isGreeting || isSmallTalk) {
      return res.json({ success: true, content: 'Hi! I can guide hand alignment for A–Z and 0–9 signs. Ask for alignment steps for a sign.' });
    }

    const userPromptParts = [];
    if (question) userPromptParts.push(`User question: ${sanitize(question)}`);

    const qLower2 = (question || '').toLowerCase();
    const sentenceIntent = /\b(sentence|form\s+sentences|grammar|make\s+a?\s*sentence|word\s*order)\b/.test(qLower2);

    if (!sentenceIntent) {
      if (detectedSign?.label) userPromptParts.push(`Detected sign: ${sanitize(detectedSign.label)} (confidence: ${detectedSign.confidence ?? 'n/a'}%)`);
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

    const messages = [
      { role: 'system', content: buildSystemPrompt(Boolean(alignmentOnly)) },
      { role: 'user', content: [userPromptParts.join('\n') || 'Teach how to form the current ISL sign.', ...intentHints].filter(Boolean).join('\n') }
    ];

    const payload = {
      model,
      messages,
      temperature: 0.4,
      max_tokens: 300,
    };

    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': process.env.FRONTEND_URL || 'http://localhost:5173',
      'X-Title': 'EchoAid AI Coach'
    };

    // Use global fetch (Node >=18)
    const resp = await fetch(OPENROUTER_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    if (!resp.ok) {
      const text = await resp.text();
      return res.status(502).json({ success: false, message: 'AI provider error', details: text.slice(0, 500) });
    }

    const data = await resp.json();
    const content = data?.choices?.[0]?.message?.content || '';
    return res.json({ success: true, content: sanitize(content) });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

