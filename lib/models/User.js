import mongoose from 'mongoose';

const SkillSchema = new mongoose.Schema({
  name: { type: String, required: true },
  verified: { type: Boolean, default: false },
  method: { type: String, enum: ['github', 'portfolio', 'quiz', 'none'], default: 'none' },
  badge: { type: String, default: '' }
});

const UserSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String, default: '' },
  bio: { type: String, default: '' },
  skills: [SkillSchema],
  portfolioLinks: [{ type: String }],
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String },
  onboarded: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.User || mongoose.model('User', UserSchema);