// api/admin/broadcast-get/register

import { NextResponse } from 'next/server';
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from '../../../../../../models/register';

export const dynamic = "force-dynamic"; // [ADDED: กัน cache ใน dev/edge]

export async function GET() { // [ADDED]
  try {
    await connectMongoDB(); // [ADDED]
    const regTypes = await Register.distinct("regType"); // [ADDED]
    const provinces = await Register.distinct("province"); // [ADDED]
    return NextResponse.json({ regTypes, provinces }); // [ADDED]
  } catch (err) {
    console.error("GET /broadcast-get/register error:", err); // [ADDED]
    return NextResponse.json(
      { error: "Server Error", detail: err.message },
      { status: 500 }
    ); // [ADDED]
  }
}