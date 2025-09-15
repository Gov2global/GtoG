import mongoose from "mongoose";

const BaacSchema = new mongoose.Schema(
  {

    baac_ID: { type: String, required: true, unique: true },
    // --- ข้อมูลส่วนตัว ---
    regLineID: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    citizenId: { type: String, required: true},
    dob: { type: Date, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    province: { type: String, required: true },
    amphur: { type: String, required: true },
    tambon: { type: String, required: true },
    postcode: { type: String, required: true },

    // --- การเกษตร ---
    mainCrops: [{ type: String, index: true }],
    otherCrops: { type: String },
    areaRai: { type: Number, default: 0 },
    areaNgan: { type: Number, default: 0 },
    areaWa: { type: Number, default: 0 },
    totalAreaSqm: { type: Number, default: 0 },
    plotLocation: { type: String },

    // --- เอกสารสิทธิ์ ---
    landDocs: [{ type: String }],
    landDocOther: { type: String },
    // landDocFiles: [{ type: String }], // เก็บ path ของไฟล์
    // otherDocs: [{ type: String }],

    // --- การเงิน ---
    yearsPlanting: { type: Number, default: 0 },
    incomePerYear: { type: Number, default: 0 },
    loanPurposes: [{ type: String }],
    loanPurposeOther: { type: String },
    loanAmount: { type: Number, required: true },

    // --- ระบบ ---
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.models.Baac || mongoose.model("Baac", BaacSchema);
