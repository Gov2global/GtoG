import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {
    regData: { type: Date },
    regID: { type: String, unique: true, required: true },
    regName: { type: String },
    regSurname: { type: String },
    regTel: { type: String },
    regLineID: { type: String },
    regProfile: { type: String },
    regPlant: { type: String },
    regPlantOther: { type: String },
    regPlantSpecies: { type: [String] },
    regPlantAmount: { type: String },
    regPlantAge: { type: String },
    areaRai: { type: Number },
    areaNgan: { type: Number },
    areaWa: { type: Number },
    province: { type: String },
    district: { type: String },
    sub_district: { type: String },
    addressDetail: { type: String },
    regType: { type: String },
    regSubType: { type: String },
    regCompany: { type: String },
    regPosition: { type: String },
    regAreaOfResponsibility: { type: String },
    regSchoolName: { type: String },
    regFruits: { type: [String] },
  },
  { timestamps: true }
);

const Register =
  mongoose.models.Register || mongoose.model("Register", registerSchema, "Register");

export default Register;
