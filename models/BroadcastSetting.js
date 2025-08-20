// models/BroadcastSetting.js
// models/BroadcastSetting.js
import mongoose from 'mongoose';

const BroadcastSettingSchema = new mongoose.Schema({
  // ใหม่: บอกชนิดข้อความ
  messageType: { type: String, enum: ['text', 'flex'], default: 'text', index: true },

  // สำหรับข้อความทั่วไป
  message: {
    type: String,
    required: function () {
      return this.messageType === 'text';
    },
  },

  // สำหรับ Flex
  altText: { type: String, default: '' },
  flexData: { type: mongoose.Schema.Types.Mixed, default: null },

  // เป้าหมาย
  targetType: { type: String, enum: ['all', 'group', 'individual'], required: true },
  targetGroup: {
    regType: { type: [String], default: [] },
    province: { type: [String], default: [] },
  },
  targetIds: { type: [String], default: [] },

  sendAt: { type: Date, required: true },
  sent: { type: Boolean, default: false },

  status: { type: String, enum: ['queued', 'processing', 'done'], default: 'queued' },
  lockId: { type: String, default: null },
  lockedAt: { type: Date, default: null },
}, { timestamps: true });

BroadcastSettingSchema.index({ sent: 1, sendAt: 1 });
BroadcastSettingSchema.index({ status: 1, sendAt: 1 });

export default mongoose.models.BroadcastSetting ||
  mongoose.model('BroadcastSetting', BroadcastSettingSchema);
