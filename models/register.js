import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {
    regDta: { type: Date, required: true },
    regLineID: { type: String, required: true },
    regName: { type: String, required: true },
    regSurname: { type: String, required: true },
    resCompanyName: { type: String, required: true },
    resInstitute: { type: String, required: true },
    resSchool: { type: String, required: true },
    resPosition: { type: String, required: true },
    resAreaofResponsibility: { type: String, required: true },
    regTel: { type: String, required: true },
    regLineID: { type: String, required: true },
    regPlant: { type: String, required: true },  
    resPlantsAreYouInterested: { type: String, required: true },
    regPlantSpecies: { type: String, required: true },
    regPlantAge: { type: String, required: true },
    regNumberOfPlants: { type: Number, required: true },
    regFarm: { type: Number, required: true },
    regNgan: { type: Number, required: true },
    regSquareWa: { type: Number, required: true },
    regProvince: { type: String, required: true },
    regDistrict: { type: String, required: true },
    regSubDistrict: { type: String, required: true },
    regPostcode: { type: String, required: true },
    regAddress: { type: String, required: true },
  },
  { timestamps: true }
);

const Register = mongoose.models.Register || mongoose.model("Register", registerSchema, "Register");
export default Register;