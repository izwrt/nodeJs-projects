import mongoose from 'mongoose';

export const connectMongoDB = async (connectionURL: string) => {
    try {
        const connection = await mongoose.connect(connectionURL)
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        process.exit(1);
    }
} 