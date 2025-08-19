// [ADDED: ย้าย API scheduler มาใช้ App Router (route.js)]
import { NextResponse } from 'next/server';
import { processDueBroadcasts } from '../../../../../lib/broadcastScheduler'; // [CHANGED: ใช้ process worker ตรง ๆ]

export async function GET() {
  try {
    const count = await processDueBroadcasts(); // [CHANGED: run immediate jobs]
    return NextResponse.json({ started: true, processed: count });
  } catch (e) {
    console.error("[/api/admin/scheduler] start error:", e);
    return NextResponse.json({ started: false, error: e?.message || "unknown" }, { status: 500 });
  }
}