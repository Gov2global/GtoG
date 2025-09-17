import mongoose from "mongoose"

const imageSchema = new mongoose.Schema({
  general: [String], // [ADDED: รูปภาพลักษณะทั่วไป (4 รูป)]
  tree: String,      // [ADDED: รูปต้น]
  leaf: String,      // [ADDED: รูปใบ]
  fruit: String,     // [ADDED: รูปผล]
}, { _id: false })    // [ADDED: ไม่สร้าง _id ซ้ำใน subdocument]

const plotSchema = new mongoose.Schema({
  regCode: { type: String, required: true, unique: true }, // [ADDED: รหัสลงทะเบียน PYYMMDDxxxxx]
  name: { type: String, required: true }, // [ADDED: ชื่อแปลง]
  lat: { type: String, required: true },  // [ADDED: ละติจูด]
  lon: { type: String, required: true },  // [ADDED: ลองจิจูด]
  plantType: { type: String, required: true }, // [ADDED: ชนิดพืช]
  spacing: { type: String, required: true },   // [ADDED: ระยะพืช]
  lineId: { type: String }, // [ADDED: Optional Line ID]
  images: imageSchema,      // [ADDED: กลุ่มรูปภาพ]
  createdAt: { type: Date, default: Date.now }, // [ADDED: เวลาที่บันทึก]
}, {
  collection: "plots" // [ADDED: ตั้งชื่อ Collection ว่า plots]
})

export default mongoose.models.Plot || mongoose.model("Plot", plotSchema)
