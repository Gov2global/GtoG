import mongoose from "mongoose";

const typeFarmSchema = new mongoose.Schema(
  {
    typeID: { type: String, required: true, unique: true }, // ✅ String ตรงกับ "TY001"
    typeDetailTH: { type: String, required: true },
    typeDetailEN: { type: String },
    subType: { type: String },
  },
  { timestamps: true }
);

// ✅ กำหนดชื่อ collection ชัดเจนว่า "typeFarm"
const TypeFarm =
  mongoose.models.typeFarm || mongoose.model("typeFarm", typeFarmSchema, "typeFarm");

export default TypeFarm;
