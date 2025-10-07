import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import Sign from '../models/Sign.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Sign data mapping
const signData = {
  alphabet: {
    // Numbers 0-10
    '0': { word: 'Zero', description: 'ISL sign for the number zero', difficulty: 'Beginner' },
    '1': { word: 'One', description: 'ISL sign for the number one', difficulty: 'Beginner' },
    '2': { word: 'Two', description: 'ISL sign for the number two', difficulty: 'Beginner' },
    '3': { word: 'Three', description: 'ISL sign for the number three', difficulty: 'Beginner' },
    '4': { word: 'Four', description: 'ISL sign for the number four', difficulty: 'Beginner' },
    '5': { word: 'Five', description: 'ISL sign for the number five', difficulty: 'Beginner' },
    '6': { word: 'Six', description: 'ISL sign for the number six', difficulty: 'Beginner' },
    '7': { word: 'Seven', description: 'ISL sign for the number seven', difficulty: 'Beginner' },
    '8': { word: 'Eight', description: 'ISL sign for the number eight', difficulty: 'Beginner' },
    '9': { word: 'Nine', description: 'ISL sign for the number nine', difficulty: 'Beginner' },
    '10': { word: 'Ten', description: 'ISL sign for the number ten', difficulty: 'Beginner' },
    // Letters A-Z
    'a': { word: 'A', description: 'ISL sign for the letter A - Make a fist with your thumb on the side of your fingers', difficulty: 'Beginner' },
    'b': { word: 'B', description: 'ISL sign for the letter B - Hold your hand flat with fingers together and thumb tucked', difficulty: 'Beginner' },
    'c': { word: 'C', description: 'ISL sign for the letter C - Curl your fingers to form a C shape', difficulty: 'Beginner' },
    'd': { word: 'D', description: 'ISL sign for the letter D - Point your index finger up with other fingers closed', difficulty: 'Beginner' },
    'e': { word: 'E', description: 'ISL sign for the letter E - Make a fist with your thumb across your fingers', difficulty: 'Beginner' },
    'f': { word: 'F', description: 'ISL sign for the letter F - Touch your index finger and thumb together', difficulty: 'Beginner' },
    'g': { word: 'G', description: 'ISL sign for the letter G - Point your index finger to the side', difficulty: 'Beginner' },
    'h': { word: 'H', description: 'ISL sign for the letter H - Point your index and middle fingers to the side', difficulty: 'Beginner' },
    'i': { word: 'I', description: 'ISL sign for the letter I - Point your pinky finger up', difficulty: 'Beginner' },
    'j': { word: 'J', description: 'ISL sign for the letter J - Point your pinky finger and trace a J shape', difficulty: 'Beginner' },
    'k': { word: 'K', description: 'ISL sign for the letter K - Point your index and middle fingers up in a V shape', difficulty: 'Beginner' },
    'l': { word: 'L', description: 'ISL sign for the letter L - Point your index finger and thumb to form an L', difficulty: 'Beginner' },
    'm': { word: 'M', description: 'ISL sign for the letter M - Hold three fingers down with thumb tucked', difficulty: 'Beginner' },
    'n': { word: 'N', description: 'ISL sign for the letter N - Hold two fingers down with thumb tucked', difficulty: 'Beginner' },
    'o': { word: 'O', description: 'ISL sign for the letter O - Form a circle with your fingers', difficulty: 'Beginner' },
    'p': { word: 'P', description: 'ISL sign for the letter P - Point your index finger down', difficulty: 'Beginner' },
    'q': { word: 'Q', description: 'ISL sign for the letter Q - Point your index finger down and to the side', difficulty: 'Beginner' },
    'r': { word: 'R', description: 'ISL sign for the letter R - Cross your index and middle fingers', difficulty: 'Beginner' },
    's': { word: 'S', description: 'ISL sign for the letter S - Make a fist with your thumb over your fingers', difficulty: 'Beginner' },
    't': { word: 'T', description: 'ISL sign for the letter T - Make a fist with your thumb between index and middle fingers', difficulty: 'Beginner' },
    'u': { word: 'U', description: 'ISL sign for the letter U - Point your index and middle fingers up together', difficulty: 'Beginner' },
    'v': { word: 'V', description: 'ISL sign for the letter V - Point your index and middle fingers up in a V shape', difficulty: 'Beginner' },
    'w': { word: 'W', description: 'ISL sign for the letter W - Point your index, middle, and ring fingers up', difficulty: 'Beginner' },
    'x': { word: 'X', description: 'ISL sign for the letter X - Bend your index finger', difficulty: 'Beginner' },
    'y': { word: 'Y', description: 'ISL sign for the letter Y - Point your thumb and pinky finger out', difficulty: 'Beginner' },
    'z': { word: 'Z', description: 'ISL sign for the letter Z - Point your index finger and trace a Z shape', difficulty: 'Beginner' }
  }
};

async function populateSignsDatabase() {
  try {
    console.log('🚀 Starting database population...');
    
    // Clear existing signs
    await Sign.deleteMany({});
    console.log('🗑️  Cleared existing signs');
    
    let totalSigns = 0;
    
    // Process alphabet category
    const alphabetPath = path.join(__dirname, '..', 'assets', 'signs', 'alphabet');
    
    if (fs.existsSync(alphabetPath)) {
      const files = fs.readdirSync(alphabetPath);
      const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp)$/i.test(file));
      
      console.log(`📁 Found ${imageFiles.length} image files in alphabet folder`);
      
      for (const file of imageFiles) {
        // Extract the base name, removing any numbers in parentheses
        let name = path.parse(file).name.toLowerCase();
        name = name.replace(/\s*\(\d+\)$/, ''); // Remove "(3)" from "a (3)"
        
        const signInfo = signData.alphabet[name];
        
        if (signInfo) {
          // Decide category: digits (including multi-digit like 10) -> 'numbers', letters -> 'alphabet'
          const isDigit = /^\d+$/.test(name);
          const category = isDigit ? 'numbers' : 'alphabet';

          const sign = new Sign({
            word: signInfo.word,
            category,
            difficulty: signInfo.difficulty,
            description: signInfo.description,
            imagePath: `assets/signs/alphabet/${file}`,
            thumbnailPath: `assets/signs/alphabet/${file}`,
            tags: [name, category, isDigit ? 'number' : 'letter'],
            signLanguageType: 'ISL',
            handDominance: 'right',
            isActive: true
          });
          
          await sign.save();
          totalSigns++;
          console.log(`✅ Added: ${signInfo.word} (${category})`);
        } else {
          console.log(`⚠️  No data found for: ${name} (from file: ${file})`);
        }
      }
    }
    
    console.log(`\n🎉 Database population completed!`);
    console.log(`📊 Total signs added: ${totalSigns}`);
    console.log(`📁 Check your database for the new signs`);
    
  } catch (error) {
    console.error('❌ Error populating database:', error);
  } finally {
    mongoose.connection.close();
    console.log('🔌 Database connection closed');
  }
}

// Run the script
populateSignsDatabase(); 