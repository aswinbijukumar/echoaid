import Sign from '../models/Sign.js';
import Category from '../models/Category.js';
import fetch from 'node-fetch';
import { getAvailableCISLRDatasets, searchCISLRDatasets } from '../utils/kaggleApi.js';

// CISLR Dataset Integration Controller
class CISLRController {
  constructor() {
    this.baseUrl = 'https://www.kaggle.com/api/v1/';
    this.datasetName = 'CISLR';
    this.apiUrl = `${this.baseUrl}datasets`;
  }

  // Auto-classify signs based on video filename patterns or label
  classifySignByFilename(filename) {
    if (!filename) return 'miscellaneous';
    
    const lowerFilename = filename.toLowerCase();
    
    // For CISLR dataset, classify based on the label (A, B, 1, 2, etc.)
    // Check if it's a single letter (A-Z)
    if (lowerFilename.match(/^[a-z]$/)) return 'alphabet';
    
    // Check if it's a single digit (0-9)
    if (lowerFilename.match(/^\d+$/)) return 'numbers';
    
    // Common patterns for classification
    const patterns = {
      'alphabet': ['letter_', 'alpha_', 'abc_', 'a_', 'b_', 'c_', 'd_', 'e_', 'f_', 'g_', 'h_', 'i_', 'j_', 'k_', 'l_', 'm_', 'n_', 'o_', 'p_', 'q_', 'r_', 's_', 't_', 'u_', 'v_', 'w_', 'x_', 'y_', 'z_'],
      'numbers': ['number_', 'num_', 'digit_', '0_', '1_', '2_', '3_', '4_', '5_', '6_', '7_', '8_', '9_', 'ten_', 'hundred_', 'thousand_'],
      'family': ['family_', 'mother_', 'father_', 'parent_', 'child_', 'baby_', 'brother_', 'sister_', 'grandmother_', 'grandfather_', 'uncle_', 'aunt_'],
      'emotions': ['happy_', 'sad_', 'angry_', 'excited_', 'tired_', 'scared_', 'surprised_', 'confused_', 'proud_', 'embarrassed_'],
      'colors': ['color_', 'red_', 'blue_', 'green_', 'yellow_', 'black_', 'white_', 'purple_', 'orange_', 'pink_', 'brown_', 'gray_'],
      'animals': ['animal_', 'dog_', 'cat_', 'bird_', 'fish_', 'horse_', 'cow_', 'pig_', 'sheep_', 'chicken_', 'duck_', 'rabbit_'],
      'food': ['food_', 'eat_', 'drink_', 'water_', 'milk_', 'bread_', 'meat_', 'fruit_', 'vegetable_', 'cake_', 'cookie_', 'pizza_'],
      'activities': ['play_', 'work_', 'study_', 'read_', 'write_', 'draw_', 'sing_', 'dance_', 'run_', 'walk_', 'swim_', 'sleep_'],
      'time': ['time_', 'day_', 'night_', 'morning_', 'evening_', 'week_', 'month_', 'year_', 'today_', 'tomorrow_', 'yesterday_'],
      'places': ['place_', 'home_', 'school_', 'hospital_', 'store_', 'park_', 'beach_', 'mountain_', 'city_', 'country_', 'room_'],
      'body': ['body_', 'hand_', 'head_', 'eye_', 'ear_', 'nose_', 'mouth_', 'arm_', 'leg_', 'foot_', 'finger_', 'toe_'],
      'clothing': ['clothes_', 'shirt_', 'pants_', 'dress_', 'shoes_', 'hat_', 'coat_', 'socks_', 'gloves_', 'belt_', 'watch_'],
      'weather': ['weather_', 'sun_', 'rain_', 'snow_', 'wind_', 'cloud_', 'hot_', 'cold_', 'warm_', 'cool_', 'storm_'],
      'phrases': ['hello_', 'goodbye_', 'thank_', 'please_', 'sorry_', 'yes_', 'no_', 'help_', 'stop_', 'go_', 'come_', 'wait_']
    };

    // Check for patterns
    for (const [category, patternList] of Object.entries(patterns)) {
      for (const pattern of patternList) {
        if (lowerFilename.includes(pattern)) {
          return category;
        }
      }
    }

    // Check for common word patterns
    if (lowerFilename.includes('_')) {
      const parts = lowerFilename.split('_');
      if (parts.length > 1) {
        // Try to classify based on the first part
        const firstPart = parts[0];
        for (const [category, patternList] of Object.entries(patterns)) {
          if (patternList.some(pattern => pattern.includes(firstPart))) {
            return category;
          }
        }
      }
    }

    return 'miscellaneous';
  }

  // Fetch CISLR dataset from Kaggle (placeholder for now)
  async fetchCISLRData(limit = 100, offset = 0) {
    try {
      console.log(`Fetching CISLR data from Kaggle: limit=${limit}, offset=${offset}`);
      
      // For now, return mock data until Kaggle integration is implemented
      // TODO: Implement Kaggle API integration
      return this.generateMockCISLRData(limit);
      
    } catch (error) {
      console.warn('Kaggle API failed, using mock data:', error);
      return this.generateMockCISLRData(limit);
    }
  }

  // Generate mock CISLR data for testing
  generateMockCISLRData(limit = 100) {
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
  }

  // Import signs from CISLR dataset
  async importCISLRSigns(req, res) {
    try {
      const { limit = 50, offset = 0, autoClassify = true } = req.body;
      
      console.log('Importing CISLR signs:', { limit, offset, autoClassify });

      // Fetch data from CISLR
      const cislrData = await this.fetchCISLRData(limit, offset);
      
      if (!cislrData || !Array.isArray(cislrData)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid CISLR data format'
        });
      }

      const importedSigns = [];
      const errors = [];

      for (const item of cislrData) {
        try {
          // Extract sign information from CISLR data
          const signData = {
            word: item.word || item.label || item.text || 'Unknown',
            description: item.description || `Sign for ${item.word || item.label || item.text}`,
            videoPath: item.video_path || item.video_url || item.file_path,
            imagePath: item.image_path || item.thumbnail_url || item.image_url,
            thumbnailPath: item.thumbnail_path || item.thumbnail_url || item.image_url,
            tags: item.tags || [],
            usage: item.usage || item.context || '',
            signLanguageType: 'ISL', // CISLR is Indian Sign Language
            isActive: true,
            createdBy: req.user._id
          };

          // Auto-classify if enabled
          if (autoClassify && signData.videoPath) {
            const filename = signData.videoPath.split('/').pop();
            signData.category = this.classifySignByFilename(filename);
          } else {
            signData.category = item.category || 'miscellaneous';
          }

          // Ensure category exists
          let category = await Category.findOne({ slug: signData.category });
          if (!category) {
            // Create new category if it doesn't exist
            category = await Category.create({
              name: signData.category.charAt(0).toUpperCase() + signData.category.slice(1),
              slug: signData.category,
              description: `Auto-generated category for ${signData.category} signs`,
              createdBy: req.user._id
            });
            console.log(`Created new category: ${category.name}`);
          }

          // Check if sign already exists
          const existingSign = await Sign.findOne({
            word: signData.word,
            category: signData.category
          });

          if (existingSign) {
            console.log(`Sign already exists: ${signData.word} in ${signData.category}`);
            continue;
          }

          // Create new sign
          const newSign = await Sign.create(signData);
          importedSigns.push(newSign);

          // Update category sign count
          await category.updateSignCount();

        } catch (error) {
          console.error(`Error importing sign:`, error);
          errors.push({
            item: item,
            error: error.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Successfully imported ${importedSigns.length} signs from CISLR`,
        data: {
          imported: importedSigns.length,
          errors: errors.length,
          signs: importedSigns.map(sign => ({
            id: sign._id,
            word: sign.word,
            category: sign.category
          })),
          errorDetails: errors
        }
      });

    } catch (error) {
      console.error('Error importing CISLR signs:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to import CISLR signs',
        error: error.message
      });
    }
  }

  // Get CISLR dataset statistics
  async getCISLRStats(req, res) {
    try {
      console.log('Fetching CISLR dataset statistics from Kaggle...');
      
      // Get available Kaggle datasets
      const availableDatasets = getAvailableCISLRDatasets();
      
      // Fetch a sample of data to get statistics
      const sampleData = await this.fetchCISLRData(100, 0);
      
      // Count categories
      const categoryCounts = {};
      sampleData.forEach(item => {
        const category = item.category || 'miscellaneous';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });
      
      // Convert to array format
      const categories = Object.entries(categoryCounts).map(([name, count]) => ({
        name,
        count
      }));
      
      const stats = {
        totalSigns: sampleData.length,
        categories,
        lastUpdated: new Date().toISOString(),
        dataset: "Kaggle CISLR Datasets",
        language: "Indian Sign Language (ISL)",
        availableDatasets: availableDatasets.length,
        kaggleDatasets: availableDatasets
      };

      return res.status(200).json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Error fetching CISLR stats:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to fetch CISLR statistics from Kaggle',
        error: error.message
      });
    }
  }

  // Auto-classify existing signs
  async autoClassifySigns(req, res) {
    try {
      const { category = null, limit = 100 } = req.query;
      
      // Get signs that need classification
      const filter = { category: { $in: ['miscellaneous', 'alphabet'] } };
      if (category) {
        filter.category = category;
      }

      const signs = await Sign.find(filter).limit(parseInt(limit));
      
      const results = {
        processed: 0,
        updated: 0,
        errors: []
      };

      for (const sign of signs) {
        try {
          results.processed++;
          
          if (sign.videoPath) {
            const filename = sign.videoPath.split('/').pop();
            const newCategory = this.classifySignByFilename(filename);
            
            if (newCategory !== sign.category) {
              // Ensure category exists
              let categoryDoc = await Category.findOne({ slug: newCategory });
              if (!categoryDoc) {
                categoryDoc = await Category.create({
                  name: newCategory.charAt(0).toUpperCase() + newCategory.slice(1),
                  slug: newCategory,
                  description: `Auto-generated category for ${newCategory} signs`,
                  createdBy: req.user._id
                });
              }

              // Update sign category
              sign.category = newCategory;
              await sign.save();
              
              // Update category counts
              await categoryDoc.updateSignCount();
              if (sign.category !== newCategory) {
                const oldCategory = await Category.findOne({ slug: sign.category });
                if (oldCategory) {
                  await oldCategory.updateSignCount();
                }
              }
              
              results.updated++;
            }
          }
        } catch (error) {
          results.errors.push({
            signId: sign._id,
            word: sign.word,
            error: error.message
          });
        }
      }

      return res.status(200).json({
        success: true,
        message: `Auto-classified ${results.updated} out of ${results.processed} signs`,
        data: results
      });

    } catch (error) {
      console.error('Error auto-classifying signs:', error);
      return res.status(500).json({
        success: false,
        message: 'Failed to auto-classify signs',
        error: error.message
      });
    }
  }
}

const cislrController = new CISLRController();

export const importCISLRSigns = (req, res) => cislrController.importCISLRSigns(req, res);
export const getCISLRStats = (req, res) => cislrController.getCISLRStats(req, res);
export const autoClassifySigns = (req, res) => cislrController.autoClassifySigns(req, res);