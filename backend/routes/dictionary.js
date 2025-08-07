import express from 'express';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const router = express.Router();

// Serve optimized sign images
router.get('/signs/:category/:imageName', async (req, res) => {
  try {
    const { category, imageName } = req.params;
    const { width, height, quality } = req.query;
    
    // Define the base path for sign images
    const baseImagePath = path.join(__dirname, '..', 'assets', 'signs', category, imageName);
    
    // Check if original image exists
    if (!fs.existsSync(baseImagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    // Create optimized version if parameters are provided
    if (width || height || quality) {
      const optimizedPath = path.join(__dirname, '..', 'assets', 'optimized', category, imageName);
      
      // Ensure optimized directory exists
      const optimizedDir = path.dirname(optimizedPath);
      if (!fs.existsSync(optimizedDir)) {
        fs.mkdirSync(optimizedDir, { recursive: true });
      }
      
      let sharpInstance = sharp(baseImagePath);
      
      if (width || height) {
        sharpInstance = sharpInstance.resize(
          width ? parseInt(width) : undefined,
          height ? parseInt(height) : undefined,
          { fit: 'inside', withoutEnlargement: true }
        );
      }
      
      if (quality) {
        sharpInstance = sharpInstance.jpeg({ quality: parseInt(quality) });
      }
      
      const optimizedBuffer = await sharpInstance.toBuffer();
      
      // Cache the optimized image
      fs.writeFileSync(optimizedPath, optimizedBuffer);
      
      res.setHeader('Content-Type', 'image/jpeg');
      res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache for 1 year
      res.send(optimizedBuffer);
    } else {
      // Serve original image
      res.sendFile(baseImagePath);
    }
  } catch (error) {
    console.error('Error serving sign image:', error);
    res.status(500).json({ error: 'Failed to serve image' });
  }
});

// Get all signs for a category
router.get('/signs/:category', (req, res) => {
  try {
    const { category } = req.params;
    const categoryPath = path.join(__dirname, '..', 'assets', 'signs', category);
    
    if (!fs.existsSync(categoryPath)) {
      return res.json({ signs: [] });
    }
    
    const files = fs.readdirSync(categoryPath);
    const imageFiles = files.filter(file => 
      /\.(jpg|jpeg|png|gif|webp)$/i.test(file)
    );
    
    const signs = imageFiles.map(file => {
      const name = path.parse(file).name;
      return {
        id: `${category}-${name}`,
        word: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '),
        category,
        imageUrl: `/api/dictionary/signs/${category}/${file}`,
        thumbnailUrl: `/api/dictionary/signs/${category}/${file}?width=200&height=200&quality=80`,
        difficulty: 'Beginner',
        description: `Sign for ${name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ')}`
      };
    });
    
    res.json({ signs });
  } catch (error) {
    console.error('Error getting signs:', error);
    res.status(500).json({ error: 'Failed to get signs' });
  }
});

// Get all categories
router.get('/categories', (req, res) => {
  try {
    const signsPath = path.join(__dirname, '..', 'assets', 'signs');
    
    if (!fs.existsSync(signsPath)) {
      return res.json({ categories: [] });
    }
    
    const categories = fs.readdirSync(signsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => ({
        id: dirent.name,
        name: dirent.name.charAt(0).toUpperCase() + dirent.name.slice(1).replace(/[-_]/g, ' '),
        count: fs.readdirSync(path.join(signsPath, dirent.name))
          .filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file)).length
      }));
    
    res.json({ categories });
  } catch (error) {
    console.error('Error getting categories:', error);
    res.status(500).json({ error: 'Failed to get categories' });
  }
});

// Search signs across all categories
router.get('/search', (req, res) => {
  try {
    const { q } = req.query;
    const signsPath = path.join(__dirname, '..', 'assets', 'signs');
    
    if (!fs.existsSync(signsPath) || !q) {
      return res.json({ signs: [] });
    }
    
    const categories = fs.readdirSync(signsPath, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory());
    
    const allSigns = [];
    
    categories.forEach(category => {
      const categoryPath = path.join(signsPath, category.name);
      const files = fs.readdirSync(categoryPath);
      
      files.forEach(file => {
        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(file)) {
          const name = path.parse(file).name;
          if (name.toLowerCase().includes(q.toLowerCase())) {
            allSigns.push({
              id: `${category.name}-${name}`,
              word: name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' '),
              category: category.name,
              imageUrl: `/api/dictionary/signs/${category.name}/${file}`,
              thumbnailUrl: `/api/dictionary/signs/${category.name}/${file}?width=200&height=200&quality=80`,
              difficulty: 'Beginner',
              description: `Sign for ${name.charAt(0).toUpperCase() + name.slice(1).replace(/[-_]/g, ' ')}`
            });
          }
        }
      });
    });
    
    res.json({ signs: allSigns });
  } catch (error) {
    console.error('Error searching signs:', error);
    res.status(500).json({ error: 'Failed to search signs' });
  }
});

export default router; 