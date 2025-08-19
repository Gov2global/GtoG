// models/BroadcastSetting.js
import mongoose from 'mongoose';

const BroadcastSettingSchema = new mongoose.Schema({
  message: { type: String, required: true },
  targetType: { type: String, enum: ['all', 'group', 'individual'], required: true },
  targetGroup: { type: Object, default: {} },
  targetIds: { type: [String], default: [] },
  sendAt: { type: Date, required: true },
  sent: { type: Boolean, default: false },

  // สำหรับ atomic worker
  status: { type: String, enum: ['queued', 'processing', 'done'], default: 'queued' },
  lockId: { type: String, default: null },
  lockedAt: { type: Date, default: null },
}, { timestamps: true });

BroadcastSettingSchema.index({ sent: 1, sendAt: 1 });
BroadcastSettingSchema.index({ status: 1, sendAt: 1 });

export default mongoose.models.BroadcastSetting ||
  mongoose.model('BroadcastSetting', BroadcastSettingSchema);