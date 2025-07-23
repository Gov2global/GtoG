// api/farmer/gen-id-product

import { connectMongoDB } from '../../../../../lib/mongodb'; 
import Product from '../../../../../models/product';
import { NextResponse } from "next/server";


// ฟังก์ชันเติมเลข 0 ซ้าย
function pad(num, len = 3) {
  return num.toString().padStart(len, "0");
}

export async function POST(req) {
  await connectMongoDB();
  const body = await req.json();

  // === GEN proID ===
  const now = new Date();
  const dd = String(now.getDate()).padStart(2, "0");
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const yy = String(now.getFullYear()).slice(-2);
  const dateCode = `${dd}${mm}${yy}`;

  // หาจำนวนที่มีในวันนั้น
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const todayEnd = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const count = await Product.countDocuments({
    createdAt: { $gte: todayStart, $lte: todayEnd }
  });

  // running = count+1
  const running = pad(count + 1, 3);
  const proID = `PRO-${dateCode}${running}`;

  // --- Save ---
  const doc = await Product.create({
    ...body,
    proID,
  });

  return NextResponse.json({ success: true, proID, data: doc });
}