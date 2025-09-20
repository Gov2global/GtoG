import mongoose from "mongoose";

const typeFarmSchema = new mongoose.Schema(
  {
    typeID: { type: Number, required: true, unique: true },   // แก้เป็น Number
    typeDetailTH: { type: String, required: true },           // แก้สะกดให้ตรง
    typeDetailEN: { type: String },
    subType: { type: String },
  },
  { timestamps: true }
);

// ✅ เพิ่ม index
typeFarmSchema.index({ typeID: 1 });

const TypeFarm =
  mongoose.models.TypeFarm || mongoose.model("TypeFarm", typeFarmSchema, "typeFarm");

export default TypeFarm;
