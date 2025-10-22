import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';

// Local MongoDB connection
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/echoaid';

// Collection names to export
const COLLECTIONS = [
  'achievements',
  'auditlogs',
  'categories',
  'lessons',
  'messages',
  'practiceattempts',
  'practicelaters',
  'questionbanks',
  'quizattempts',
  'quizzes',
  'signs',
  'skills',
  'units',
  'userachievements',
  'userprogresses',
  'users',
  'usersessions',
  'userskillprogresses'
];

// Connect to local MongoDB
const connectLocal = async () => {
  try {
    await mongoose.connect(LOCAL_MONGODB_URI);
    console.log('✅ Connected to local MongoDB');
    return mongoose.connection;
  } catch (error) {
    console.error('❌ Failed to connect to local MongoDB:', error.message);
    throw error;
  }
};

// Export a single collection
const exportCollection = async (conn, collectionName) => {
  try {
    console.log(`\n📤 Exporting collection: ${collectionName}`);
    
    const db = conn.db('echoaid');
    const collection = db.collection(collectionName);
    const documents = await collection.find({}).toArray();
    
    if (documents.length === 0) {
      console.log(`⚠️  Collection ${collectionName} is empty, skipping...`);
      return;
    }
    
    console.log(`📊 Found ${documents.length} documents in ${collectionName}`);
    
    // Create export directory
    const exportDir = path.join(process.cwd(), 'data-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }
    
    // Export to JSON file
    const filePath = path.join(exportDir, `${collectionName}.json`);
    fs.writeFileSync(filePath, JSON.stringify(documents, null, 2));
    console.log(`✅ Exported ${documents.length} documents to ${filePath}`);
    
  } catch (error) {
    console.error(`❌ Error exporting collection ${collectionName}:`, error.message);
    throw error;
  }
};

// Main export function
const exportData = async () => {
  let conn = null;
  
  try {
    console.log('🚀 Starting data export from local MongoDB...\n');
    
    // Connect to local MongoDB
    conn = await connectLocal();
    
    // Export each collection
    for (const collectionName of COLLECTIONS) {
      await exportCollection(conn, collectionName);
    }
    
    console.log('\n🎉 Export completed successfully!');
    console.log('📁 All data exported to ./data-export/ directory');
    console.log('📋 Next steps:');
    console.log('1. Go to MongoDB Atlas');
    console.log('2. Use "Import Data" feature');
    console.log('3. Upload the JSON files from ./data-export/');
    
  } catch (error) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  } finally {
    // Close connection
    if (conn) {
      await conn.close();
      console.log('🔌 Closed local MongoDB connection');
    }
  }
};

// Run export
exportData();