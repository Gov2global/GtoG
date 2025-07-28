//  models/product.js
import mongoose from "mongoose";

const productReportSchema = new mongoose.Schema(
  {
    proID: { type: String, required: true, unique: true }, // รหัส
    regLineID: { type: String },
    fullName: { type: String, required: true },
    phone: { type: String, required: true },
    farmName: { type: String, required: true },
    plantTypes: [{ type: String, required: true }],
    areaRai: { type: Number, default: 0 },
    areaNgan: { type: Number, default: 0 },
    areaWa: { type: Number, default: 0 },
    estimate: { type: String },
    period: { type: String },
    note: { type: String },
  },
  { timestamps: true }
);

export default mongoose.models.ProductReport ||
  mongoose.model("ProductReport", productReportSchema);
