//api/line/set-richmenu/route.js
import { connectMongoDB } from '../../../../../../lib/mongodb';
import Register from '../../../../../../models/register';
import axios from 'axios';

export async function POST(req) {
  const { userId } = await req.json();
  await connectMongoDB();
  const user = await Register.findOne({ regLineID: userId });
  const isRegistered = !!user;
  const richMenuId = isRegistered
    ? 'richmenu-370037ea591efaf5a7d4af363333dacf'
    : 'richmenu-9e2ef7471e5fab457460e7f94a0c995c';
  await axios.post(
    `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`,
    {},
    { headers: { Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}` } }
  );
  return Response.json({ success: true, isRegistered });
}
