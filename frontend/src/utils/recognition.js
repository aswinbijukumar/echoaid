export async function extractLandmarksFromImageData(imageData) {
  // Placeholder for potential future use. MediaPipe is invoked directly in components.
  return null;
}

import { ENV_CONFIG } from './prettyConfig.js';

export async function scoreLandmarks(signId, landmarks) {
  const API_BASE_URL = ENV_CONFIG.API_BASE_URL;
  const token = typeof localStorage !== 'undefined' ? localStorage.getItem('token') : null;

  const res = await fetch(`${API_BASE_URL}/api/practice/score`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { 'Authorization': `Bearer ${token}` } : {})
    },
    body: JSON.stringify({ signId, landmarks })
  });

  if (!res.ok) {
    let message = 'Backend scoring failed';
    try {
      const data = await res.json();
      message = data?.message || message;
    } catch {
      const text = await res.text();
      if (text) message = text;
    }
    throw new Error(message);
  }
  return res.json();
}

