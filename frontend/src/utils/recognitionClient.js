// Route via backend so we can auth, log attempts, and unify thresholds
import { ENV_CONFIG } from '../config/prettyConfig.js';
const PRACTICE_RECOGNIZE_URL = `${ENV_CONFIG.API_BASE_URL}/api/practice/recognize`;

export async function detectImageFromBlob(imageBlob, { signId } = {}) {
  try {
    console.log('[detect] sending blob', { size: imageBlob?.size });
  } catch {
    // ignore logging errors
  }
  const form = new FormData();
  form.append('image', imageBlob, 'frame.jpg');
  if (signId) form.append('signId', signId);
  const token = localStorage.getItem('token');
  const res = await fetch(PRACTICE_RECOGNIZE_URL, {
    method: 'POST',
    headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
    body: form
  });
  if (!res.ok) throw new Error('Detection failed');
  const data = await res.json();
  try {
    const top = Array.isArray(data?.detections) && data.detections[0];
    console.log('[detect] response', { count: data?.detections?.length || 0, top });
  } catch {
    // ignore logging errors
  }
  return data;
}

// New function to handle data URLs (base64 images)
export async function detectImageFromDataUrl(dataUrl, { signId } = {}) {
  try {
    console.log('[detect] sending dataURL', { length: dataUrl?.length });

    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();

    const form = new FormData();
    form.append('image', blob, 'frame.jpg');
    if (signId) form.append('signId', signId);
    const token = localStorage.getItem('token');
    const res = await fetch(PRACTICE_RECOGNIZE_URL, {
      method: 'POST',
      headers: token ? { 'Authorization': `Bearer ${token}` } : undefined,
      body: form
    });

    if (!res.ok) throw new Error('Detection failed');
    const data = await res.json();

    console.log('[detect] response', {
      success: data?.success,
      detections: data?.detections?.length || 0,
      time: data?.time_ms
    });

    return data;
  } catch (error) {
    console.error('[detect] error:', error);
    throw error;
  }
}