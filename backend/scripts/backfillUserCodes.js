import mongoose from 'mongoose';
import dotenv from 'dotenv';
import fs from 'fs';
import crypto from 'crypto';
import User from '../models/User.js';

// Load env from backend config.env first (project uses this), then fallback to .env
if (fs.existsSync(new URL('../config.env', import.meta.url))) {
  dotenv.config({ path: new URL('../config.env', import.meta.url).pathname });
} else {
  dotenv.config();
}

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid_main';

function generateCandidate() {
  const rand = crypto.randomBytes(6).toString('hex');
  return `EA-${parseInt(rand, 16).toString(36).toUpperCase().slice(0, 8)}`;
}

async function generateUniqueUserCode() {
  for (let attempts = 0; attempts < 8; attempts++) {
    const candidate = generateCandidate();
    const exists = await User.exists({ userCode: candidate });
    if (!exists) return candidate;
  }
  return `EA-${Date.now().toString(36).toUpperCase()}`;
}

async function backfill() {
  await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to MongoDB');

  const cursor = User.find({ $or: [{ userCode: { $exists: false } }, { userCode: null }, { userCode: '' }] }).cursor();
  let processed = 0;
  for await (const user of cursor) {
    try {
      user.userCode = await generateUniqueUserCode();
      await user.save({ validateBeforeSave: false });
      processed += 1;
      if (processed % 50 === 0) console.log(`Assigned userCode for ${processed} users...`);
    } catch (e) {
      console.error(`Failed to assign userCode for ${user._id}:`, e.message);
    }
  }
  console.log(`Done. Assigned userCode for ${processed} users.`);
  await mongoose.disconnect();
}

backfill().catch(async (e) => {
  console.error('Backfill failed:', e);
  try { await mongoose.disconnect(); } catch {}
  process.exit(1);
});

