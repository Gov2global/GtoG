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
    ? 'richmenu-2bf18f235fabf148d57cbf2d988bcc11'
    : 'richmenu-de998bd0e0ffeb7d4bdacf46a282c010';
  await axios.post(
    `https://api.line.me/v2/bot/user/${userId}/richmenu/${richMenuId}`,
    {},
    { headers: { Authorization: `Bearer ${process.env.LINE_ACCESS_TOKEN}` } }
  );
  return Response.json({ success: true, isRegistered });
}
