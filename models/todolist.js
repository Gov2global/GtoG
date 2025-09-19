// api/mission/get/todolist
import mongoose from 'mongoose'

const todolistSchema = new mongoose.Schema({
  ID: { type: String, required: true, unique: true },
  "Code-farmer": { type: String, required: true },
  "Code-Doing": { type: String, required: true },
  Detail: { type: String, required: true }
}, {
  collection: 'todolist', // [CHANGED: ใช้ชื่อ collection ตรงตัว]
  timestamps: true,
  versionKey: false
})

// [CHANGED: เปลี่ยนชื่อ model เป็น 'todolist' (พิมพ์เล็ก)]
export default mongoose.models.todolist || mongoose.model('todolist', todolistSchema)
