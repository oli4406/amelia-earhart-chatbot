/**
 * Mongoose Message model.
 * Stores a user's question and the chatbot's generated answer.
 * @module models/Message
 * @typedef {Object} Message
 * @property {string} userId - MongoDB ObjectId referencing the User.
 * @property {string} question - The user's message.
 * @property {string} answer - The chatbot's response.
 * @property {Date} ts - Timestamp of message creation.
 */
import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    question: { type: String, required: true },
    answer: { type: String, required: true },
    ts: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);

export default Message;
