import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  user: { type: String, ref: 'User', required: true },
  type: { type: String, required: true },
  content: { type: String, required: true },
  read: { type: Boolean, default: false },
  link: { type: String, default: '' },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Notification || mongoose.model('Notification', NotificationSchema);