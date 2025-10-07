import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema({
  actorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  action: { type: String, required: true }, // e.g., update_user, delete_user, update_admin
  onModel: { type: String, required: true }, // 'User'
  targetId: { type: mongoose.Schema.Types.ObjectId, required: true },
  reason: { type: String, default: '' },
  before: { type: mongoose.Schema.Types.Mixed, default: null },
  after: { type: mongoose.Schema.Types.Mixed, default: null }
}, { timestamps: true });

export default mongoose.model('AuditLog', auditLogSchema);

