import mongoose from "mongoose";

const regGAPSchema = new mongoose.Schema(
  {
    gapID: { type: String, unique: true, required: true },
    regName: { type: String },
    regSurname: { type: String },
    regTel: { type: String },
    regLineID: { type: String },
    regProfile: { type: String },
    regPlant: { type: String },
    province: { type: String },
    district: { type: String },
    sub_district: { type: String },
    addressDetail: { type: String },
    farmName: { type: String },
    fruitType: { type: [String] },
    urlMAP: { type: String },
    document: { type: [String] },
    documentOther: { type: [String] },
    demandFarmer: { type: [String] }
  },
  { timestamps: true }
);

const RegGAP =
  mongoose.models.RegGAP || mongoose.model("RegGAP", regGAPSchema, "RegGAP");

export default RegGAP;
