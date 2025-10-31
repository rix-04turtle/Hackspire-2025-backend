import dotenv from 'dotenv';
import mongoose from 'mongoose';
dotenv.config(); // Load environment variables from .env file

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn.connection.db; // Return the db object, not the connection
    } catch (error) {
        console.error(`Error: ${error.message}`);
        return null
    }
};
export default connectDB;
export { connectDB };