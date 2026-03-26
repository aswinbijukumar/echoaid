import { MongoClient } from 'mongodb';

// Fixed Atlas connection string with proper SSL settings
const ATLAS_URI = 'mongodb+srv://oogysama:Aswin%402003@echoaiddb.pudtwgb.mongodb.net/echoaid?retryWrites=true&w=majority&appName=echoaiddb&ssl=true&authSource=admin';

// Test connection function
const testConnection = async () => {
  let client = null;
  
  try {
    console.log('🔍 Testing Atlas connection with SSL fixes...');
    console.log('📡 Connection string:', ATLAS_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Create client with SSL options
    client = new MongoClient(ATLAS_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: true,
      authSource: 'admin'
    });
    
    // Connect to Atlas
    await client.connect();
    console.log('✅ Successfully connected to Atlas MongoDB!');
    
    // Test database access
    const db = client.db('echoaid');
    console.log('✅ Database "echoaid" accessible');
    
    // List collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Existing collections:', collections.map(c => c.name));
    
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
    } else if (error.message.includes('SSL')) {
      console.log('🔍 SSL issue - try different connection method');
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