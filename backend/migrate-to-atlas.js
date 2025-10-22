import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Local MongoDB connection
const LOCAL_MONGODB_URI = 'mongodb://localhost:27017/echoaid';

// Atlas MongoDB connection (you'll need to provide this)
const ATLAS_MONGODB_URI = process.env.ATLAS_MONGODB_URI || 'mongodb+srv://username:password@cluster.mongodb.net/echoaid';

// Create separate mongoose instances
const localMongoose = mongoose.createConnection();
const atlasMongoose = mongoose.createConnection();

// Collection names to migrate
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
    await localMongoose.openUri(LOCAL_MONGODB_URI);
    console.log('✅ Connected to local MongoDB');
    return localMongoose;
  } catch (error) {
    console.error('❌ Failed to connect to local MongoDB:', error.message);
    throw error;
  }
};

// Connect to Atlas MongoDB
const connectAtlas = async () => {
  try {
    await atlasMongoose.openUri(ATLAS_MONGODB_URI);
    console.log('✅ Connected to Atlas MongoDB');
    return atlasMongoose;
  } catch (error) {
    console.error('❌ Failed to connect to Atlas MongoDB:', error.message);
    throw error;
  }
};

// Migrate a single collection
const migrateCollection = async (localConn, atlasConn, collectionName) => {
  try {
    console.log(`\n🔄 Migrating collection: ${collectionName}`);
    
    // Get data from local database
    const localDb = localConn.db('echoaid');
    const localCollection = localDb.collection(collectionName);
    const documents = await localCollection.find({}).toArray();
    
    if (documents.length === 0) {
      console.log(`⚠️  Collection ${collectionName} is empty, skipping...`);
      return;
    }
    
    console.log(`📊 Found ${documents.length} documents in ${collectionName}`);
    
    // Insert data into Atlas database
    const atlasDb = atlasConn.db('echoaid');
    const atlasCollection = atlasDb.collection(collectionName);
    
    // Clear existing data in Atlas (optional - comment out if you want to keep existing data)
    await atlasCollection.deleteMany({});
    console.log(`🗑️  Cleared existing data in Atlas ${collectionName}`);
    
    // Insert new data
    if (documents.length > 0) {
      await atlasCollection.insertMany(documents);
      console.log(`✅ Successfully migrated ${documents.length} documents to Atlas ${collectionName}`);
    }
    
  } catch (error) {
    console.error(`❌ Error migrating collection ${collectionName}:`, error.message);
    throw error;
  }
};

// Main migration function
const migrateData = async () => {
  let localConn = null;
  let atlasConn = null;
  
  try {
    console.log('🚀 Starting data migration from local MongoDB to Atlas...\n');
    
    // Connect to local MongoDB
    localConn = await connectLocal();
    
    // Connect to Atlas MongoDB
    atlasConn = await connectAtlas();
    
    // Migrate each collection
    for (const collectionName of COLLECTIONS) {
      await migrateCollection(localConn, atlasConn, collectionName);
    }
    
    console.log('\n🎉 Migration completed successfully!');
    console.log('📊 All data has been transferred to Atlas MongoDB');
    
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    process.exit(1);
  } finally {
    // Close connections
    if (localConn) {
      await localConn.close();
      console.log('🔌 Closed local MongoDB connection');
    }
    if (atlasConn) {
      await atlasConn.close();
      console.log('🔌 Closed Atlas MongoDB connection');
    }
  }
};

// Run migration
migrateData();