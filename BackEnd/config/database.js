import mongoose from 'mongoose';

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
