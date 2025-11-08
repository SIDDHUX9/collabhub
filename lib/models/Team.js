import mongoose from 'mongoose';

const TeamSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  project: { type: String, ref: 'Project', required: true },
  members: [{ type: String, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Team || mongoose.model('Team', TeamSchema);