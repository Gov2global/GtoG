// api/admin/farmer/information
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Register from "../../../../../../models/register";
import Plant from "../../../../../../models/plant";
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";
const MAX_LIMIT = 1000;

// small helper
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const q          = (searchParams.get("q") || "").trim();
    const plant      = (searchParams.get("plant") || "").trim();
    const species    = (searchParams.get("species") || "").trim();
    const subDistrict= (searchParams.get("sub_district") || "").trim();
    const district   = (searchParams.get("district") || "").trim();
    const province   = (searchParams.get("province") || "").trim();
    const regSubType = (searchParams.get("regSubType") || "").trim();
    const cursor     = searchParams.get("cursor");
    const limitParam = Number(searchParams.get("limit") || 100);
    const limit      = Math.min(Math.max(limitParam, 1), MAX_LIMIT); // 1..1000

    // ✅ base: เฉพาะเกษตรกร
    const match = { regType: "เกษตรกร" };

    // 🔎 คำค้นรวม
    if (q) {
      const rx = new RegExp(esc(q), "i");
      match.$or = [
        { regName: rx },
        { regSurname: rx },
        { regTel: rx },
        { addressDetail: rx },
      ];
    }

    // 🔎 จังหวัด/สถานะย่อย
    if (province)  match.province   = new RegExp(`^${esc(province)}$`, "i"); // เทียบชื่อตรงแบบ case-insensitive
    if (regSubType) match.regSubType = regSubType;

    // 🔎 ตำบล/อำเภอ (บางทีสะกดไม่เป๊ะ → ใช้ regex)
    if (subDistrict) match.sub_district = new RegExp(esc(subDistrict), "i");
    if (district)    match.district     = new RegExp(esc(district), "i");

    // 🔎 ชนิดพืช: รับทั้งรหัสหรือชื่อภาษาไทย + คำว่า other
    if (plant) {
      if (plant.toLowerCase() === "other") {
        match.regPlant = { $in: ["other", "Other", "OTHER"] };
      } else {
        // ค้นรหัสที่ตรง หรือชื่อไทยที่แมตช์
        const rx = new RegExp(esc(plant), "i");
        const plantDocs = await Plant.find(
          { $or: [{ plantID: plant }, { plantNameTH: rx }] },
          { plantID: 1 }
        ).lean();

        const ids = [...new Set(plantDocs.map((p) => String(p.plantID)))];
        // ถ้า user ใส่รหัสที่ไม่มีใน collection หรืออยากให้ลองเทียบตรงๆ ด้วย
        if (!ids.includes(plant)) ids.push(plant);

        // regPlant อาจเป็น string หรือ array → ใช้ $in ก็จับทั้งคู่ได้
        match.regPlant = { $in: ids };
      }
    }

    // 🔎 สายพันธุ์: เก็บเป็น array → ใช้ regex ตรงกับสมาชิกใดๆ
    if (species) {
      const rx = new RegExp(esc(species), "i");
      match.regPlantSpecies = rx; // Mongo จะจับภายใน array ให้โดยอัตโนมัติ
    }

    // 🔎 Cursor-based pagination (ใหม่→เก่า)
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      match._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    // แนะนำ index (run one-time on MongoDB):
    // db.register.createIndex({ _id: -1 })
    // db.register.createIndex({ regType: 1, province: 1, regSubType: 1 })
    // db.register.createIndex({ regName: 1, regSurname: 1, regTel: 1 })
    // db.register.createIndex({ district: 1, sub_district: 1 })
    // db.register.createIndex({ regPlant: 1 })
    // db.register.createIndex({ regPlantSpecies: 1 })

    const rows = await Register.find(match, {
      _id: 1,
      regName: 1,
      regSurname: 1,
      regTel: 1,
      regPlant: 1,
      regPlantAmount: 1,
      regPlantOther: 1,
      regPlantSpecies: 1,
      regPlantAge: 1,
      areaWa: 1,
      areaNgan: 1,
      areaRai: 1,
      addressDetail: 1,
      sub_district: 1,
      district: 1,
      province: 1,
      regSubType: 1,
      createdAt: 1,
      regType: 1,
    })
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean();

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    // สร้างชุดรหัสพืชที่อยู่ในหน้านี้ (ยกเว้น other)
    const plantIdSet = new Set();
    for (const r of pageRows) {
      const p = r.regPlant;
      if (Array.isArray(p)) {
        p.forEach((code) => {
          const id = String(code || "").trim();
          if (id && id.toLowerCase() !== "other") plantIdSet.add(id);
        });
      } else {
        const id = String(p || "").trim();
        if (id && id.toLowerCase() !== "other") plantIdSet.add(id);
      }
    }

    // ดึงชื่อไทยให้รหัสที่เกี่ยวข้อง
    let plantMap = {};
    if (plantIdSet.size > 0) {
      const plants = await Plant.find(
        { plantID: { $in: Array.from(plantIdSet) } },
        { plantID: 1, plantNameTH: 1 }
      ).lean();
      plantMap = Object.fromEntries(plants.map((p) => [String(p.plantID), p.plantNameTH]));
    }

    const nameFromId = (id) => {
      const s = String(id || "").trim();
      if (!s) return "-";
      if (s.toLowerCase() === "other") return "Other";
      return plantMap[s] || s;
    };

    const data = pageRows.map((r) => {
      const createdAtTH = r.createdAt
        ? new Date(r.createdAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })
        : "-";

      const regPlantCodes = Array.isArray(r.regPlant)
        ? r.regPlant.map(String)
        : r.regPlant ? [String(r.regPlant)] : [];

      const regPlantNames = regPlantCodes.length
        ? regPlantCodes.map(nameFromId)
        : ["-"];

      return {
        id: String(r._id),
        regName: r.regName ?? "-",
        regSurname: r.regSurname ?? "-",
        regTel: r.regTel ?? "-",

        regPlantCodes,
        regPlant: regPlantNames, // ส่งกลับเป็นชื่อแสดงผล (array)

        regPlantAmount: r.regPlantAmount ?? 0,
        regPlantOther: r.regPlantOther ?? "-",
        regPlantSpecies: Array.isArray(r.regPlantSpecies) ? r.regPlantSpecies : [],
        regPlantAge: r.regPlantAge ?? "-",
        areaWa: r.areaWa ?? 0,
        areaNgan: r.areaNgan ?? 0,
        areaRai: r.areaRai ?? 0,
        addressDetail: r.addressDetail ?? "-",
        sub_district: r.sub_district ?? "-",
        district: r.district ?? "-",
        province: r.province ?? "-",
        regSubType: r.regSubType ?? "-",
        createdAtTH,
      };
    });

    const nextCursor = hasMore ? String(pageRows[pageRows.length - 1]._id) : null;

    return NextResponse.json({ data, nextCursor, hasMore }, { status: 200 });
  } catch (err) {
    console.error("INFORMATION_API_ERROR:", err);
    return NextResponse.json({ message: err?.message || "เกิดข้อผิดพลาด" }, { status: 500 });
  }
}