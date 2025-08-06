import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: './config.env' });

console.log('Testing MongoDB connection...');
console.log('MongoDB URI:', process.env.MONGODB_URI);

async function testDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // List all databases
    const adminDb = mongoose.connection.db.admin();
    const dbs = await adminDb.listDatabases();
    console.log('📋 Available databases:');
    dbs.databases.forEach(db => {
      console.log(`  - ${db.name}`);
    });
    
    // Check if echoaid database exists
    const echoaidExists = dbs.databases.some(db => db.name === 'echoaid');
    if (echoaidExists) {
      console.log('✅ EchoAid database exists!');
    } else {
      console.log('⚠️  EchoAid database does not exist yet - it will be created when first user registers');
    }
    
    // Test creating a collection
    const testCollection = mongoose.connection.db.collection('test');
    await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Database write test successful!');
    
    // Clean up test data
    await testCollection.deleteOne({ test: 'connection' });
    console.log('✅ Database cleanup successful!');
    
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 MongoDB disconnected');
  }
}

testDatabase(); 