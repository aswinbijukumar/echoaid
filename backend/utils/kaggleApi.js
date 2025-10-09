// Kaggle API integration for CISLR dataset
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Kaggle credentials
const KAGGLE_USERNAME = 'oogynub';
const KAGGLE_KEY = 'ad78f3a6bb71b99d5810d37aa1b2e464';

// Kaggle API configuration
const KAGGLE_API_BASE = 'https://www.kaggle.com/api/v1';

/**
 * Setup Kaggle API credentials
 */
export const setupKaggleCredentials = () => {
  const kaggleDir = path.join(process.env.HOME || process.env.USERPROFILE, '.kaggle');
  
  if (!fs.existsSync(kaggleDir)) {
    fs.mkdirSync(kaggleDir, { recursive: true });
  }
  
  const kaggleJson = {
    username: KAGGLE_USERNAME,
    key: KAGGLE_KEY
  };
  
  const kaggleJsonPath = path.join(kaggleDir, 'kaggle.json');
  fs.writeFileSync(kaggleJsonPath, JSON.stringify(kaggleJson, null, 2));
  
  // Set proper permissions (Unix-like systems)
  if (process.platform !== 'win32') {
    fs.chmodSync(kaggleJsonPath, '600');
  }
  
  console.log('Kaggle credentials configured successfully');
};

/**
 * Search for CISLR datasets on Kaggle
 */
export const searchCISLRDatasets = async () => {
  try {
    const response = await fetch(`${KAGGLE_API_BASE}/datasets/search?search=indian+sign+language`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${KAGGLE_USERNAME}:${KAGGLE_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Kaggle API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error searching Kaggle datasets:', error);
    throw error;
  }
};

/**
 * Get dataset metadata
 */
export const getDatasetMetadata = async (datasetSlug) => {
  try {
    const response = await fetch(`${KAGGLE_API_BASE}/datasets/view/${datasetSlug}`, {
      headers: {
        'Authorization': `Basic ${Buffer.from(`${KAGGLE_USERNAME}:${KAGGLE_KEY}`).toString('base64')}`,
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Kaggle API error: ${response.status}`);
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching dataset metadata:', error);
    throw error;
  }
};

/**
 * Download dataset files (placeholder for future implementation)
 */
export const downloadDataset = async (datasetSlug, outputPath) => {
  // This would require the Kaggle CLI or direct API calls
  // For now, return a placeholder
  console.log(`Would download dataset ${datasetSlug} to ${outputPath}`);
  return { success: true, message: 'Download functionality not yet implemented' };
};

/**
 * List available CISLR datasets
 */
export const getAvailableCISLRDatasets = () => {
  return [
    {
      slug: 'indian-sign-language-dataset',
      title: 'Indian Sign Language Dataset',
      description: 'A comprehensive dataset of Indian Sign Language gestures',
      size: '500MB',
      files: ['images/', 'labels.csv'],
      url: 'https://www.kaggle.com/datasets/indian-sign-language-dataset'
    },
    {
      slug: 'isl-alphabet-numbers',
      title: 'ISL Alphabet and Numbers',
      description: 'Indian Sign Language alphabet and number gestures',
      size: '200MB',
      files: ['alphabet/', 'numbers/', 'metadata.json'],
      url: 'https://www.kaggle.com/datasets/isl-alphabet-numbers'
    },
    {
      slug: 'continuous-isl-recognition',
      title: 'Continuous ISL Recognition Dataset',
      description: 'Video dataset for continuous Indian Sign Language recognition',
      size: '2GB',
      files: ['videos/', 'annotations.csv'],
      url: 'https://www.kaggle.com/datasets/continuous-isl-recognition'
    }
  ];
};

export default {
  setupKaggleCredentials,
  searchCISLRDatasets,
  getDatasetMetadata,
  downloadDataset,
  getAvailableCISLRDatasets
};