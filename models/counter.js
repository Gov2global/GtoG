// models/counter.js
import mongoose from "mongoose"

const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // [ADDED: ใช้ key เช่น regCode-20250920]
  seq: { type: Number, default: 0 },     // [ADDED: ตัวเลขรัน]
})

export default mongoose.models.Counter || mongoose.model("Counter", counterSchema)
