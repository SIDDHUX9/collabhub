import mongoose from 'mongoose';

const RoleSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  applicants: [{ type: String, ref: 'User' }]
});

const ProjectSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  creator: { type: String, ref: 'User', required: true },
  requiredRoles: [RoleSchema],
  techStack: [{ type: String }],
  status: { type: String, enum: ['open', 'in-progress', 'completed'], default: 'open' },
  team: { type: String, ref: 'Team' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);