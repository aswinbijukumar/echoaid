import mongoose from 'mongoose';

const practiceLaterSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  sign: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Sign',
    required: true,
    index: true
  },
  note: {
    type: String,
    trim: true,
    default: ''
  }
}, {
  timestamps: true
});

practiceLaterSchema.index({ user: 1, sign: 1 }, { unique: true });

export default mongoose.model('PracticeLater', practiceLaterSchema);

