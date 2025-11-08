import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  column: { type: String, enum: ['To Do', 'In Progress', 'In Review', 'Done'], default: 'To Do' },
  team: { type: String, ref: 'Team', required: true },
  assignee: { type: String, ref: 'User', default: null },
  createdAt: { type: Date, default: Date.now },
  order: { type: Number, default: 0 }
});

export default mongoose.models.Task || mongoose.model('Task', TaskSchema);