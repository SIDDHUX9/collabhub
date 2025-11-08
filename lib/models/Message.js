import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  content: { type: String, required: true },
  author: { type: String, ref: 'User', required: true },
  team: { type: String, ref: 'Team', required: true },
  channel: { type: String, default: 'general' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Message || mongoose.model('Message', MessageSchema);