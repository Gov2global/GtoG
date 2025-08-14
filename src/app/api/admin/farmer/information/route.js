// api/admin/farmer/information
// api/admin/farmer/information
import { connectMongoDB } from "../../../../../../lib/mongodb";
import Register from "../../../../../../models/register";
import Plant from "../../../../../../models/plant"; // ✅ ใช้โมเดลตรง ๆ เพื่อ query ชื่อพืช
import { NextResponse } from "next/server";
import mongoose from "mongoose";

export const runtime = "nodejs";

const MAX_LIMIT = 1000;

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();
    const province = (searchParams.get("province") || "").trim();
    const regSubType = (searchParams.get("regSubType") || "").trim();
    const limitParam = Number(searchParams.get("limit") || 100);
    const limit = Math.min(Math.max(limitParam, 1), MAX_LIMIT); // 1..1000
    const cursor = searchParams.get("cursor"); // last _id for next page

    // ✅ ดึงเฉพาะ regType = "เกษตรกร"
    const match = { regType: "เกษตรกร" };

    // ค้นหาข้อความ
    if (q) {
      const rx = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
      match.$or = [
        { regName: rx },
        { regSurname: rx },
        { regTel: rx },
        { addressDetail: rx },
      ];
    }

    // กรองจังหวัด/สถานะย่อย
    if (province) match.province = province;
    if (regSubType) match.regSubType = regSubType;

    // Cursor-based pagination (_id เรียงจากใหม่ไปเก่า)
    if (cursor && mongoose.Types.ObjectId.isValid(cursor)) {
      match._id = { $lt: new mongoose.Types.ObjectId(cursor) };
    }

    // แนะนำ Index (รันใน MongoDB ครั้งเดียว):
    // db.register.createIndex({ _id: -1 })
    // db.register.createIndex({ regType: 1, province: 1, regSubType: 1 })
    // db.register.createIndex({ regName: 1, regSurname: 1, regTel: 1 })
    // db.register.createIndex({ addressDetail: "text" })

    const rows = await Register.find(match, {
      _id: 1,
      regName: 1,
      regSurname: 1,
      regTel: 1,
      regPlant: 1,           // <- รหัสพืช (เช่น PLA001 หรือ array ของรหัส)
      regPlantAmount: 1,
      regPlantOther: 1,
      regPlantSpecies: 1,    // Array
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
      .limit(limit + 1) // เผื่อเช็คว่ามีหน้าถัดไป
      .lean();

    const hasMore = rows.length > limit;
    const pageRows = hasMore ? rows.slice(0, limit) : rows;

    // -----------------------------
    // 🔎 เตรียมแม็ป plantID -> plantNameTH (เฉพาะรหัสที่มีใน "หน้า" นี้เท่านั้น เพื่อประสิทธิภาพ)
    // -----------------------------
    const plantIdSet = new Set();
    for (const r of pageRows) {
      const p = r.regPlant;
      if (Array.isArray(p)) {
        for (const code of p) {
          const id = String(code || "").trim();
          if (id && id.toLowerCase() !== "other") plantIdSet.add(id);
        }
      } else {
        const id = String(p || "").trim();
        if (id && id.toLowerCase() !== "other") plantIdSet.add(id);
      }
    }

    let plantMap = {};
    if (plantIdSet.size > 0) {
      // ⚠️ ตรงนี้สมมติว่าในคอลเลกชัน Plant เก็บฟิลด์รหัสใน "plantID"
      // ถ้าโปรเจกต์คุณเก็บเป็นฟิลด์อื่น (เช่น code, _id) ปรับตรงนี้ให้ตรงสคีมา
      const plants = await Plant.find(
        { plantID: { $in: Array.from(plantIdSet) } },
        { plantID: 1, plantNameTH: 1 }
      ).lean();

      plantMap = Object.fromEntries(
        plants.map((p) => [String(p.plantID), p.plantNameTH])
      );
    }

    const nameFromId = (id) => {
      if (!id) return "-";
      const s = String(id).trim();
      if (!s) return "-";
      if (s.toLowerCase() === "other") return "Other"; // ✅ กรณีระบุ other
      return plantMap[s] || s; // ถ้าไม่เจอใน map ให้ fallback แสดงรหัสเดิม
    };

    // แปลงเป็น payload + เวลาไทย
    const data = pageRows.map((r) => {
      const createdAtTH = r.createdAt
        ? new Date(r.createdAt).toLocaleString("th-TH", { timeZone: "Asia/Bangkok" })
        : "-";

      const codes = Array.isArray(r.regPlant)
        ? r.regPlant.map(String)
        : (r.regPlant ? String(r.regPlant) : "-");

      const names =
        Array.isArray(codes)
          ? codes.map(nameFromId)
          : nameFromId(codes);

      return {
        id: String(r._id),
        regName: r.regName ?? "-",
        regSurname: r.regSurname ?? "-",
        regTel: r.regTel ?? "-",

        // ✅ ส่งทั้งรหัสเดิมและชื่อที่แปลงแล้ว
        regPlantCodes: Array.isArray(codes) ? codes : (codes === "-" ? [] : [codes]),
        regPlant: Array.isArray(names) ? names : (names === "-" ? [] : [names]),

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

    return NextResponse.json(
      { data, nextCursor, hasMore },
      { status: 200 }
    );
  } catch (err) {
    console.error("INFORMATION_API_ERROR:", err);
    return NextResponse.json(
      { message: err?.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}
