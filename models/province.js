import mongoose from "mongoose";

const provinceSchema = new mongoose.Schema(
  {
    postcode: { type: Number, required: true }, // ✅ ตัวเลข
    sub_district: { type: String, required: true, trim: true },
    district: { type: String, required: true, trim: true },
    province: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);


const Province = mongoose.models.province || mongoose.model("province", provinceSchema, "province");

export default Province;
