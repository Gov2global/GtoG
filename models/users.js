// import mongoose from 'mongoose'
// import bcrypt from 'bcryptjs'

// // --- Roles ที่รองรับ: ใช้ให้ตรงกับฝั่ง UI/RBAC ---
// export const ROLES = ['admin', 'educational', 'local', 'government', 'private', 'farmer']

// const usersSchema = new mongoose.Schema(
//   {
//     username: {
//       type: String,
//       required: true,
//       trim: true,
//       minlength: 3,
//       maxlength: 50,
//       lowercase: true, // normalize เพื่อความ unique
//       unique: true,
//       index: true,
//       immutable: true, // ไม่ให้แก้ username หลังสร้าง
//     },
//     password: {
//       type: String,
//       required: true,
//       select: false, // ไม่ดึงออกมาโดย default
//     },
//     name: { type: String, required: true, trim: true },
//     email: {
//       type: String,
//       required: true,
//       trim: true,
//       lowercase: true,
//       unique: true,
//       index: true,
//       match: /[^@\s]+@[^@\s]+\.[^@\s]+/, // ตรวจสอบรูปแบบ email เบื้องต้น
//     },
//     phone: { type: String, required: true, trim: true },
//     role: {
//       type: String,
//       required: true,
//       lowercase: true,
//       enum: ROLES,
//       index: true,
//     },
//     isActive: { type: Boolean, default: true, index: true },

//     // เก็บ sessionId ไว้ชั่วคราว (ถ้าใช้ session store แยก สามารถลบ field นี้ได้)
//     sessionId: { type: String, select: false },

//     // ข้อมูลเสริมที่มีประโยชน์ในการทำงานจริง
//     lastLoginAt: { type: Date },
//     failedLoginAttempts: { type: Number, default: 0 },
//   },
//   {
//     timestamps: true,
//     versionKey: false,
//     toJSON: {
//       virtuals: true,
//       transform: function (doc, ret) {
//         ret.id = ret._id?.toString()
//         delete ret._id
//         delete ret.password // ปิดข้อมูลสำคัญเสมอ
//         delete ret.sessionId
//         return ret
//       },
//     },
//   }
// )

// // --- Index เพิ่มเติม ---
// usersSchema.index({ name: 'text' }) // สำหรับค้นหาชื่อแบบ full-text

// // --- Hash password อัตโนมัติ ---
// usersSchema.pre('save', async function (next) {
//   if (!this.isModified('password')) return next()
//   const salt = await bcrypt.genSalt(12)
//   this.password = await bcrypt.hash(this.password, salt)
//   next()
// })

// // --- Method สำหรับเช็ค password ---
// usersSchema.methods.comparePassword = function (plain) {
//   return bcrypt.compare(plain, this.password)
// }

// // --- สร้าง/ใช้โมเดล (กันซ้ำตอน HMR ของ Next.js) ---
// const Users = mongoose.models.Users || mongoose.model('Users', usersSchema, 'Users')
// export default Users


import mongoose from 'mongoose'
import bcrypt from 'bcrypt'          // ✅ ใช้ native แทน bcryptjs

export const ROLES = ['admin', 'educational', 'local', 'government', 'private', 'farmer']

const usersSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 50,
      lowercase: true,
      unique: true,
      index: true,
      immutable: true,
    },
    password: {
      type: String,
      required: true,
      select: false,
    },
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      unique: true,
      index: true,
      match: /[^@\s]+@[^@\s]+\.[^@\s]+/,
    },
    phone: { type: String, required: true, trim: true },
    role: {
      type: String,
      required: true,
      lowercase: true,
      enum: ROLES,
      index: true,
    },
    isActive: { type: Boolean, default: true, index: true },

    sessionId: { type: String, select: false, index: true }, // ✅ index เพื่อ lookup หลัง login

    lastLoginAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      virtuals: true,
      transform: function (doc, ret) {
        ret.id = ret._id?.toString()
        delete ret._id
        delete ret.password
        delete ret.sessionId
        return ret
      },
    },
    toObject: { virtuals: true }, // เผื่อบางที่ใช้ .toObject()
  }
)

// ✅ compound indexes ช่วย use-case login
usersSchema.index({ isActive: 1, email: 1 })
usersSchema.index({ isActive: 1, username: 1 })

// (พิจารณา) ถ้าไม่ได้ใช้จริง ตัด text index นี้ออกเพื่อลด resource
// usersSchema.index({ name: 'text' })

// --- Normalizers ---
usersSchema.pre('save', function (next) {
  if (this.isModified('phone') && typeof this.phone === 'string') {
    this.phone = this.phone.replace(/[^\d]/g, '') // เก็บเฉพาะตัวเลข
  }
  next()
})

// --- Hash password อัตโนมัติ (รอบ 10 จะเร็วขึ้น) ---
usersSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  const rounds = Number(process.env.BCRYPT_ROUNDS || 10)
  this.password = await bcrypt.hash(this.password, rounds)
  next()
})

// --- Method สำหรับเช็ค password ---
usersSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

// --- แปลง error E11000 ให้อ่านง่าย (option) ---
usersSchema.post('save', function (err, doc, next) {
  if (err && err.code === 11000) {
    if (err.keyPattern?.email) return next(new Error('อีเมลนี้ถูกใช้งานแล้ว'))
    if (err.keyPattern?.username) return next(new Error('ชื่อผู้ใช้นี้ถูกใช้งานแล้ว'))
  }
  next(err)
})

const Users = mongoose.models.Users || mongoose.model('Users', usersSchema, 'Users')
export default Users