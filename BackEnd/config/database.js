/**
 * Handles MongoDB connection using Mongoose.
 * Attempts connection and logs success/failure.
 * @module config/database
 */
import mongoose from 'mongoose';

/**
 * Connects to the MongoDB instance for the application.
 * @async
 * @function connectDatabase
 * @returns {Promise<boolean>} Resolves true on success, throws on failure.
 * @throws {Error} When the connection fails.
 */
export async function connectDatabase() {
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect('mongodb://localhost:27017/amelia-earhart-chatbot');
    console.log('Connected to MongoDB successfully');
    return true;
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
    console.error('Full error:', error);
    throw error;
  }
}

export default connectDatabase;
