import mongoose from "mongoose";

const typeFarmSchema = new mongoose.Schema(
  {
    typeID: { type: String, required: true, unique: true },
    typeDetailTH: { type: String, required: true },
    typeDetailEN: { type: String },
    subType: { type: String },
  },
  { timestamps: true }
);

const TypeFarm = mongoose.models.typeFarm || mongoose.model("typeFarm", typeFarmSchema, "typeFarm");

export default TypeFarm;
