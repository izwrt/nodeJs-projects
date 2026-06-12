import mongoose from 'mongoose';

export const connectMongoDB = async (connectionURL: string) => {
    try {
        // Mongoose establishes a persistent connection to the database.
        // We await it here to ensure the connection succeeds before starting the Express server.
        const connection = await mongoose.connect(connectionURL)
    } catch (error) {
        console.error("Error connecting to MongoDB:", error);
        // process.exit(1) kills the Node.js process immediately if the DB connection fails.
        // This is a best practice so Docker/PM2 can automatically restart the container.
        process.exit(1);
    }
} 