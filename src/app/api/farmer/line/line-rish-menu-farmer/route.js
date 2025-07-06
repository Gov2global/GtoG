//api/farmer/line/line-rish-menu-farmer
import { connectMongoDB } from '../../../../../../lib/lineRichMenu';
import Register from '../../../../../../models/register';
import { NextResponse } from "next/server";
import axios from "axios";

const RICHMENU_REGISTERED = 'richmenu-2bf18f235fabf148d57cbf2d988bcc11';
const RICHMENU_DEFAULT = 'richmenu-de998bd0e0ffeb7d4bdacf46a282c010';

export async function POST(req) {
  try {
    const { userId } = await req.json();
    if (!userId) {
      return NextResponse.json({ success: false, message: "userId required" }, { status: 400 });
    }

    await connectMongoDB();
    const user = await Register.findOne({ regLineID: userId });
    const isRegistered = !!user;

    const richMenuId = isRegistered ? RICHMENU_REGISTERED : RICHMENU_DEFAULT;

    await axios.post(
      `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`,
      {},
      {
        headers: {
          Authorization: `Bearer ${process.env.LINE_CHANNEL_ACCESS_TOKEN}`,
        },
      }
    );

    return NextResponse.json({ success: true, isRegistered });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: error?.response?.data?.message || error.message || "Set RichMenu failed",
        error: error?.response?.data || null,
      },
      { status: 500 }
    );
  }
}
