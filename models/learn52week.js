import mongoose from "mongoose";

const Learn52WeekSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, trim: true },
    week: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true },
    type: { type: String, required: true, trim: true },
    span: { type: String, trim: true },
    operation: { type: String, trim: true },
    pruning: { type: String, trim: true },
    fertilizing: { type: String, trim: true },
    disease: { type: String, trim: true },
    insect: { type: String, trim: true },
    giving_water: { type: String, trim: true },
  },
  {
    collection: "learn52week",
    timestamps: true,
    versionKey: false,
  }
);

export default mongoose.models.learn52week ||
  mongoose.model("learn52week", Learn52WeekSchema, "learn52week");