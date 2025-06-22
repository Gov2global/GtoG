import mongoose from "mongoose";

const registerSchema = new mongoose.Schema(
  {
    regDta: { type: Date},
    regLineID: { type: String },
    regName: { type: String },
    regSurname: { type: String },
    resCompanyName: { type: String},
    resInstitute: { type: String},
    resSchool: { type: String},
    resPosition: { type: String },
    resAreaofResponsibility: { type: String },
    regTel: { type: String },
    regLineID: { type: String},
    regPlant: { type: String },  
    resPlantsAreYouInterested: { type: String},
    regPlantSpecies: { type: String},
    regPlantAge: { type: String},
    regNumberOfPlants: { type: Number },
    regFarm: { type: Number},
    regNgan: { type: Number},
    regSquareWa: { type: Number },
    regProvince: { type: String },
    regDistrict: { type: String},
    regSubDistrict: { type: String},
    regPostcode: { type: String},
    regAddress: { type: String },
  },
  { timestamps: true }
);

const Register = mongoose.models.Register || mongoose.model("Register", registerSchema, "Register");
export default Register;