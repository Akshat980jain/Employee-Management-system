import mongoose from 'mongoose';
import { dualWriteManager } from './dual-write.js';

export const connectDB = async () => {
    // Read MONGODB_URI inside function to ensure dotenv has loaded
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ems_db';

    // Log connection info for debugging (hide password)
    const sanitizedUri = MONGODB_URI.replace(/:([^@]+)@/, ':****@');
    console.log('🔗 Connecting to MongoDB:', sanitizedUri);

    try {
        await mongoose.connect(MONGODB_URI);
        console.log('✅ MongoDB connected successfully');

        // Initialize dual-write connection to secondary database
        await dualWriteManager.initialize();
    } catch (error) {
        console.error('❌ MongoDB connection error:', error);
        process.exit(1);
    }
};

mongoose.connection.on('error', (err) => {
    console.error('MongoDB error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected');
});

export default mongoose;
