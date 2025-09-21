// app/api/health/mongo/route.js
import { NextResponse } from "next/server";
import mongoose from "mongoose";
import connectMongoDB from "../../../../../lib/mongodb";

export async function GET() {
  try {
    // เชื่อม MongoDB
    await connectMongoDB();

    // map state → เป็นคำอ่าน
    const stateMap = {
      0: "disconnected",
      1: "connected",
      2: "connecting",
      3: "disconnecting",
    };

    const state = mongoose.connection.readyState;
    const statusText = stateMap[state] || "unknown";

    return NextResponse.json({
      ok: true,
      mongooseState: state,
      mongooseStatus: statusText,
      host: mongoose.connection.host,
      name: mongoose.connection.name,
    });
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: err.message },
      { status: 500 }
    );
  }
}
