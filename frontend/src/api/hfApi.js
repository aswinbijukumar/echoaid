// Kaggle API integration for CISLR dataset
const KAGGLE_USERNAME = 'oogynub';
const KAGGLE_KEY = 'ad78f3a6bb71b99d5810d37aa1b2e464';

// Generate mock CISLR data for testing (since we'll use Kaggle datasets)
export const generateMockCISLRData = (limit = 100) => {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const numbers = '0123456789';
  const allLabels = [...alphabet.split(''), ...numbers.split('')];
  
  return allLabels.slice(0, limit).map((label, index) => ({
    word: label,
    video_path: `https://example.com/videos/${label.toLowerCase()}.mp4`,
    image_path: `https://example.com/images/${label.toLowerCase()}.jpg`,
    thumbnail_path: `https://example.com/images/${label.toLowerCase()}.jpg`,
    label: label,
    video_url: `https://example.com/videos/${label.toLowerCase()}.mp4`,
    description: `Sign for the letter/number ${label}`,
    usage: `Used in spelling and communication`,
    tags: ['spelling', 'communication'],
    signLanguageType: 'ISL',
    category: /[0-9]/.test(label) ? 'numbers' : 'alphabet'
  }));
};

// Mock functions for CISLR data (will be replaced with Kaggle integration)
export const fetchCISLRVideos = async (split = "train", limit = 20) => {
  // Return mock data for now
  const mockData = generateMockCISLRData(limit);
  return mockData.map(item => ({
    label: item.label,
    videoUrl: item.video_url
  }));
};

export const fetchCISLRStats = async () => {
  // Return mock stats
  return {
    dataset: "Kaggle CISLR Dataset",
    totalRows: 1000,
    features: ['label', 'video_path', 'image_path'],
    lastUpdated: new Date().toISOString()
  };
};

export const fetchCISLRData = async (limit = 100, offset = 0) => {
  // Return mock data for now
  return generateMockCISLRData(limit);
};