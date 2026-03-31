/**
 * imageUtils.js
 * 
 * Client-side utilities for image manipulation and compression.
 */

/**
 * Resizes and compresses a data URL image to JPEG format.
 * Targets a specific height (default 640px) to match backend requirements
 * while drastically reducing upload payload size.
 * 
 * @param {string} dataUrl - The original base64 image data.
 * @param {number} targetHeight - The desired height (default 640).
 * @param {number} quality - JPEG compression quality (0 to 1).
 * @returns {Promise<string>} - The compressed data URL.
 */
export const compressImage = (dataUrl, targetHeight = 640, quality = 0.85) => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.src = dataUrl;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      // Calculate new dimensions (preserving aspect ratio)
      const scale = targetHeight / img.height;
      const targetWidth = img.width * scale;

      canvas.width = targetWidth;
      canvas.height = targetHeight;

      // Draw and compress
      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);
      
      // Convert to JPEG with specified quality
      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      resolve(compressedDataUrl);
    };
    img.onerror = (err) => reject(new Error('Failed to load image for compression: ' + err.message));
  });
};
