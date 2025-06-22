import mongoose from "mongoose";

const plantSchema = new mongoose.Schema(
  {
    plantID: { type: String, required: true, unique: true }, // เปลี่ยนจาก Date เป็น String
    plantNameTH: { type: String, required: true },
    plantNameEN: { type: String },
  },
  { timestamps: true }
);


const Plant = mongoose.models.plant || mongoose.model("plant", plantSchema, "plant");

export default Plant;
