import mongoose from 'mongoose';

const MESSAGE_TYPES = ['text', 'flex', 'image'];
const TARGET_TYPES = ['all', 'group', 'individual'];

const BroadcastSettingSchema = new mongoose.Schema(
  {
    messageType: {
      type: String,
      enum: MESSAGE_TYPES,
      default: 'text',
    },

    // ข้อความทั่วไป
    message: {
      type: String,
      required: function () {
        return this.messageType === 'text';
      },
      trim: true,
    },

    // Flex
    altText: { type: String, default: '', trim: true },
    flexData: { type: mongoose.Schema.Types.Mixed, default: null },

    // เป้าหมาย
    targetType: { type: String, enum: TARGET_TYPES, required: true },
    targetGroup: {
      regType: { type: [String], default: [] },
      province: { type: [String], default: [] },
    },
    targetIds: { type: [String], default: [] },

    // เวลา & สถานะ
    sendAt: { type: Date, required: true },
    sent: { type: Boolean, default: false },
    status: {
      type: String,
      enum: ['queued', 'processing', 'done', 'error'],
      default: 'queued',
    },

    lockId: { type: String, default: null },
    lockedAt: { type: Date, default: null },

    processingAttempts: { type: Number, default: 0, min: 0 },
    lastError: { type: String, default: '' },
    errorAt: { type: Date, default: null },

    // media
    media: {
      originalContentUrl: { type: String, default: '' },
      previewImageUrl: { type: String, default: '' },
      contentType: { type: String, default: '' },
      sizeBytes: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: (_doc, ret) => {
        if (!ret.lastError) delete ret.lastError;
        return ret;
      },
    },
    toObject: { virtuals: true },
  }
);

/* ========== [VALIDATIONS] ========== */
BroadcastSettingSchema.pre('validate', function (next) {
  if (this.messageType === 'flex') {
    if (!this.altText?.trim()) return next(new Error('altText is required for flex messageType'));
    if (!this.flexData) return next(new Error('flexData is required for flex messageType'));
  }

  if (this.messageType === 'text') {
    if (!this.message?.trim()) return next(new Error('message is required for text messageType'));
  }

  if (this.messageType === 'image') {
    if (!this.media?.originalContentUrl?.trim()) {
      return next(new Error('media.originalContentUrl is required for image messageType'));
    }
  }

  if (this.targetType === 'all') {
    if ((this.targetIds?.length ?? 0) > 0) return next(new Error('targetIds must be empty when targetType is "all"'));
    if ((this.targetGroup?.regType?.length ?? 0) > 0 || (this.targetGroup?.province?.length ?? 0) > 0) {
      return next(new Error('targetGroup must be empty when targetType is "all"'));
    }
  }

  if (this.targetType === 'group') {
    const hasGroup = (this.targetGroup?.regType?.length ?? 0) > 0 || (this.targetGroup?.province?.length ?? 0) > 0;
    if (!hasGroup) return next(new Error('targetGroup (regType or province) is required when targetType is "group"'));
    if ((this.targetIds?.length ?? 0) > 0) return next(new Error('targetIds must be empty when targetType is "group"'));
  }

  if (this.targetType === 'individual') {
    if ((this.targetIds?.length ?? 0) === 0) return next(new Error('targetIds is required when targetType is "individual"'));
    if ((this.targetGroup?.regType?.length ?? 0) > 0 || (this.targetGroup?.province?.length ?? 0) > 0) {
      return next(new Error('targetGroup must be empty when targetType is "individual"'));
    }
  }

  next();
});

/* ========== [INDEXES] ========== */
// งานที่ยังไม่ส่ง เรียงตามเวลา
BroadcastSettingSchema.index({ sent: 1, sendAt: 1 });
// งานตาม status + เวลา
BroadcastSettingSchema.index({ status: 1, sendAt: 1 });
// งานที่ค้างใน processing
BroadcastSettingSchema.index(
  { status: 1, lockedAt: 1 },
  { partialFilterExpression: { status: 'processing' } }
);
// สำหรับ filter/search
BroadcastSettingSchema.index({ targetType: 1 });
BroadcastSettingSchema.index({ 'targetGroup.regType': 1 });
BroadcastSettingSchema.index({ 'targetGroup.province': 1 });
BroadcastSettingSchema.index({ targetIds: 1 });

/* ========== [STATIC HELPERS] ========== */
BroadcastSettingSchema.statics.claimDueJob = async function ({
  lockId,
  lockTtlMs = 5 * 60 * 1000,
  now = new Date(),
}) {
  const lockExpiredBefore = new Date(now.getTime() - lockTtlMs);
  return this.findOneAndUpdate(
    {
      sent: false,
      $or: [
        { status: 'queued', sendAt: { $lte: now } },
        { status: 'processing', lockedAt: { $lte: lockExpiredBefore } },
      ],
    },
    {
      $set: { status: 'processing', lockId, lockedAt: now, lastError: '', errorAt: null },
      $inc: { processingAttempts: 1 },
    },
    { sort: { sendAt: 1, createdAt: 1 }, new: true }
  ).lean(false);
};

BroadcastSettingSchema.statics.clearLock = async function (id) {
  return this.findByIdAndUpdate(id, { $set: { lockId: null, lockedAt: null } }, { new: true });
};

BroadcastSettingSchema.statics.markDone = async function (id) {
  return this.findByIdAndUpdate(id, { $set: { sent: true, status: 'done', lockId: null, lockedAt: null } }, { new: true });
};

BroadcastSettingSchema.statics.markError = async function (id, message) {
  return this.findByIdAndUpdate(
    id,
    {
      $set: {
        status: 'error',
        lastError: String(message || '').slice(0, 2000),
        errorAt: new Date(),
        lockId: null,
        lockedAt: null,
      },
    },
    { new: true }
  );
};

/** ✅ Hot-reload safe */
if (mongoose.models.BroadcastSetting) {
  if (mongoose.deleteModel) mongoose.deleteModel('BroadcastSetting');
  else delete mongoose.models.BroadcastSetting;
}
const BroadcastSetting =
  mongoose.models.BroadcastSetting || mongoose.model('BroadcastSetting', BroadcastSettingSchema);

export default BroadcastSetting;
