import { MongoClient } from 'mongodb';

// Your Atlas connection string
const ATLAS_URI = 'mongodb+srv://oogysama:Aswin%402003@echoaiddb.pudtwgb.mongodb.net/echoaid?retryWrites=true&w=majority&appName=echoaiddb';

// Test connection function
const testConnection = async () => {
  let client = null;
  
  try {
    console.log('🔍 Testing Atlas connection...');
    console.log('📡 Connection string:', ATLAS_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Create client
    client = new MongoClient(ATLAS_URI);
    
    // Connect to Atlas
    await client.connect();
    console.log('✅ Successfully connected to Atlas MongoDB!');
    
    // Test database access
    const db = client.db('echoaid');
    console.log('✅ Database "echoaid" accessible');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Existing collections:', collections.map(c => c.name));
    
    // Test a simple operation
    const testCollection = db.collection('test');
    const result = await testCollection.insertOne({ test: 'connection', timestamp: new Date() });
    console.log('✅ Test insert successful:', result.insertedId);
    
    // Clean up test document
    await testCollection.deleteOne({ _id: result.insertedId });
    console.log('🧹 Test document cleaned up');
    
    console.log('\n🎉 Atlas connection is working perfectly!');
    console.log('📋 Ready to import data or deploy to Railway');
    
  } catch (error) {
    console.error('❌ Connection failed:', error.message);
    
    if (error.message.includes('ENOTFOUND')) {
      console.log('🔍 DNS resolution issue - check your internet connection');
    } else if (error.message.includes('authentication')) {
      console.log('🔍 Authentication issue - check username/password');
    } else if (error.message.includes('network')) {
      console.log('🔍 Network issue - check firewall/proxy settings');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 Connection closed');
    }
  }
};

// Run test
testConnection();