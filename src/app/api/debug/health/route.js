// app/api/debug/health/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import { connectMongoDB } from "../../../../../lib/mongodb";

export async function GET() {
  try {
    // พยายาม connect DB
    const conn = await connectMongoDB();

    // state ของ connection
    const state = mongoose.connection.readyState;
    let stateText = "unknown";
    switch (state) {
      case 0:
        stateText = "disconnected";
        break;
      case 1:
        stateText = "connected";
        break;
      case 2:
        stateText = "connecting";
        break;
      case 3:
        stateText = "disconnecting";
        break;
    }

    // test query เบา ๆ ว่าติดต่อได้จริง
    const dbName = conn.connection.name;
    const host = conn.connection.host;
    const collections = await conn.connection.db.listCollections().toArray();

    return NextResponse.json(
      {
        ok: true,
        mongo: {
          state,
          stateText,
          host,
          dbName,
          collections: collections.map((c) => c.name), // รายชื่อ collections
        },
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Health check error:", err);
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
