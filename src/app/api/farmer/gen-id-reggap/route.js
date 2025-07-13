// api/farmer/gen-id-reggap
import { connectMongoDB } from '../../../../../lib/mongodb'; 
import RegGAP from '../../../../../models/regGAP';
import { NextResponse } from "next/server";

export async function GET() {
  await connectMongoDB();

  const now = new Date();
  const yy = now.getFullYear().toString().slice(-2);
  const mm = (now.getMonth() + 1).toString().padStart(2, "0");
  const dd = now.getDate().toString().padStart(2, "0");
  const todayPrefix = `GAP${yy}${mm}${dd}`;

  const lastToday = await RegGAP.findOne({ gapID: { $regex: `^${todayPrefix}` } })
    .sort({ gapID: -1 });

  let nextNumber = 1;
  if (lastToday?.gapID) {
    const match = lastToday.gapID.match(/^GAP\d{6}(\d{3})$/);
    if (match) {
      nextNumber = parseInt(match[1], 10) + 1;
    }
  }
  const nextID = `${todayPrefix}${nextNumber.toString().padStart(3, "0")}`;

  return NextResponse.json({ success: true, gapID: nextID });
}