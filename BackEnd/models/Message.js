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
