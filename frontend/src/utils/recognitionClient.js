const DETECT_URL = 'http://localhost:8001/detect';

export async function detectImageFromBlob(imageBlob) {
  try {
    console.log('[detect] sending blob', { size: imageBlob?.size });
  } catch {}
  const form = new FormData();
  form.append('file', imageBlob, 'frame.jpg');
  const res = await fetch(DETECT_URL, {
    method: 'POST',
    body: form
  });
  if (!res.ok) throw new Error('Detection failed');
  const data = await res.json();
  try {
    const top = Array.isArray(data?.detections) && data.detections[0];
    console.log('[detect] response', { count: data?.detections?.length || 0, top });
  } catch {}
  return data;
}

// New function to handle data URLs (base64 images)
export async function detectImageFromDataUrl(dataUrl) {
  try {
    console.log('[detect] sending dataURL', { length: dataUrl?.length });
    
    // Convert data URL to blob
    const response = await fetch(dataUrl);
    const blob = await response.blob();
    
    const form = new FormData();
    form.append('file', blob, 'frame.jpg');
    
    const res = await fetch(DETECT_URL, {
      method: 'POST',
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