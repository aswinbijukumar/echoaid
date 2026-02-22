
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const checkDb = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`Connected to host: ${conn.connection.host}`);
        console.log(`Active Database Name: ${conn.connection.name}`);
        console.log(`Collections in ${conn.connection.name}:`);
        const collections = await conn.connection.db.listCollections().toArray();
        collections.forEach(c => console.log(` - ${c.name}`));
        process.exit(0);
    } catch (error) {
        console.error('DB Connection Error:', error);
        process.exit(1);
    }
};

checkDb();
