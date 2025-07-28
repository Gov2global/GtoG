// api/farmer/gen-id-product

import { connectMongoDB } from '../../../../../lib/mongodb'; 
import ProductReport  from '../../../../../models/product';
import { NextResponse } from "next/server";


// ฟังก์ชันเติมเลข 0 ซ้าย
function pad(num, len = 3) {
  return num.toString().padStart(len, "0");
}

export async function POST(req) {
  await connectMongoDB();

  try {
    const body = await req.json();

    // === GEN proID ===
    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yy = String(now.getFullYear()).slice(-2);
    const dateCode = `${dd}${mm}${yy}`;

    // นับจำนวนของวันนี้
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
    const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
    const count = await ProductReport.countDocuments({
      createdAt: { $gte: todayStart, $lte: todayEnd }
    });

    const running = pad(count + 1, 3);
    const proID = `PRO-${dateCode}${running}`;

    // Safety: แปลง area เป็น number, plantTypes เป็น string[]
    const dataToSave = {
      ...body,
      proID,
      areaRai: Number(body.areaRai) || 0,
      areaNgan: Number(body.areaNgan) || 0,
      areaWa: Number(body.areaWa) || 0,
      plantTypes: Array.isArray(body.plantTypes)
        ? body.plantTypes.map((x) => (typeof x === "string" ? x : x.value || ""))
        : [],
      regLineID: body.regLineID || "",
    };

    // --- Save ---
    const doc = await ProductReport.create(dataToSave);

    return NextResponse.json({ success: true, proID, data: doc });

  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}