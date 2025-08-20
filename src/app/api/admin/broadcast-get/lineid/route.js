// api/admin/broadcast-get/lineid

import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from '../../../../../../models/register';

export const dynamic = "force-dynamic"; // [ADDED]

export async function GET() { // [ADDED]
  try {
    await connectMongoDB(); // [ADDED]
    const users = await Register.find(
      {},
      { regName: 1, regSurname: 1, regLineID: 1 }
    ).lean(); // [ADDED]

    const list = users
      .filter(u => !!u.regLineID)
      .map(u => ({
        label: `${u.regName || ""} ${u.regSurname || ""}`.trim() || "(ไม่ระบุชื่อ)", // [ADDED]
        value: u.regLineID, // [ADDED]
      })); // [ADDED]

    return NextResponse.json({ users: list }); // [ADDED]
  } catch (err) {
    console.error("GET /broadcast-get/lineid error:", err); // [ADDED]
    return NextResponse.json(
      { error: "Server Error", detail: err.message },
      { status: 500 }
    ); // [ADDED]
  }
}