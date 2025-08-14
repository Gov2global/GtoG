// api/admin/farmer/dashboard

import { connectMongoDB } from "../../../../../../lib/mongodb";
import Register from "../../../../../../models/register";
import { NextResponse } from "next/server";


export const runtime = "nodejs";

function pct(part, total) {
  if (!total) return 0;
  return Number(((part / total) * 100).toFixed(2));
}

export async function GET(req) {
  try {
    await connectMongoDB();

    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    const base = { regType: "เกษตรกร" };

    if (start || end) {
      base.regData = {};
      if (start) base.regData.$gte = new Date(start);
      if (end) {
        const endDate = new Date(end);
        endDate.setHours(23, 59, 59, 999);
        base.regData.$lte = endDate;
      }
    }

    const [total, renterCaretaker, owner] = await Promise.all([
      Register.countDocuments(base),
      Register.countDocuments({ ...base, regSubType: "ผู้เช่าปลูก/ผู้ดูแลสวน" }),
      Register.countDocuments({ ...base, regSubType: "เจ้าของสวน" }),
    ]);

    const other = Math.max(total - renterCaretaker - owner, 0);

    // 🔹 รวมตามจังหวัด/อำเภอ
    const byProvince = await Register.aggregate([
      { $match: base },
      {
        $group: {
          _id: {
            province: { $ifNull: ["$province", "ไม่ระบุจังหวัด"] },
            district: { $ifNull: ["$district", "ไม่ระบุอำเภอ"] },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.province": 1, "_id.district": 1 } },
      {
        $group: {
          _id: "$_id.province",
          total: { $sum: "$count" },
          districts: { $push: { name: "$_id.district", count: "$count" } }, // <- ห้ามพิมพ์เป็น "$._id.district"
        },
      },
      {
        $project: {
          _id: 0,
          province: "$_id",
          total: 1,
          districts: 1,
        },
      },
      { $sort: { province: 1 } },
    ]);

    return NextResponse.json({
      total,
      renterCaretaker,
      owner,
      other,
      percents: {
        renterCaretaker: pct(renterCaretaker, total),
        owner: pct(owner, total),
        other: pct(other, total),
      },
      byProvince, // 👈 ส่งให้ UI
    });
  } catch (err) {
    console.error("DASHBOARD_API_ERROR:", err);
    return NextResponse.json(
      { message: err?.message || "เกิดข้อผิดพลาด" },
      { status: 500 }
    );
  }
}