import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config({ path: './config.env' });

// Database configurations for different microservices
const databases = {
  // Main application database (users, auth, etc.)
  main: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/echoaid_main',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Dictionary service database
  dictionary: {
    uri: process.env.DICTIONARY_DB_URI || 'mongodb://localhost:27017/echoaid_dictionary',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Quiz service database
  quiz: {
    uri: process.env.QUIZ_DB_URI || 'mongodb://localhost:27017/echoaid_quiz',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Forum service database
  forum: {
    uri: process.env.FORUM_DB_URI || 'mongodb://localhost:27017/echoaid_forum',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  
  // Video service database
  video: {
    uri: process.env.VIDEO_DB_URI || 'mongodb://localhost:27017/echoaid_video',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  }
};

// Connection instances
const connections = {};

// Connect to a specific database
export const connectToDatabase = async (serviceName) => {
  try {
    if (connections[serviceName]) {
      return connections[serviceName];
    }

    const config = databases[serviceName];
    if (!config) {
      throw new Error(`Database configuration not found for service: ${serviceName}`);
    }

    const connection = await mongoose.createConnection(config.uri, config.options);
    
    connection.on('connected', () => {
      console.log(`✅ Connected to ${serviceName} database`);
    });

    connection.on('error', (err) => {
      console.error(`❌ ${serviceName} database connection error:`, err);
    });

    connection.on('disconnected', () => {
      console.log(`🔌 Disconnected from ${serviceName} database`);
    });

    connections[serviceName] = connection;
    return connection;
  } catch (error) {
    console.error(`❌ Failed to connect to ${serviceName} database:`, error);
    throw error;
  }
};

// Get connection for a service
export const getConnection = (serviceName) => {
  return connections[serviceName];
};

// Close all connections
export const closeAllConnections = async () => {
  for (const [serviceName, connection] of Object.entries(connections)) {
    if (connection) {
      await connection.close();
      console.log(`🔌 Closed ${serviceName} database connection`);
    }
  }
};

// Health check for all databases
export const checkDatabaseHealth = async () => {
  const health = {};
  
  for (const serviceName of Object.keys(databases)) {
    try {
      const connection = connections[serviceName];
      if (connection && connection.readyState === 1) {
        health[serviceName] = { status: 'connected', readyState: connection.readyState };
      } else {
        health[serviceName] = { status: 'disconnected', readyState: connection?.readyState || 0 };
      }
    } catch (error) {
      health[serviceName] = { status: 'error', error: error.message };
    }
  }
  
  return health;
};

// Initialize all database connections
export const initializeDatabases = async () => {
  console.log('🚀 Initializing database connections...');
  
  try {
    // Connect to main database first (for auth)
    await connectToDatabase('main');
    
    // Connect to other service databases
    await connectToDatabase('dictionary');
    await connectToDatabase('quiz');
    await connectToDatabase('forum');
    await connectToDatabase('video');
    
    console.log('✅ All database connections initialized');
    
    // Log health status
    const health = await checkDatabaseHealth();
    console.log('📊 Database Health Status:', health);
    
  } catch (error) {
    console.error('❌ Failed to initialize databases:', error);
    throw error;
  }
};

export default {
  connectToDatabase,
  getConnection,
  closeAllConnections,
  checkDatabaseHealth,
  initializeDatabases,
  databases
}; 