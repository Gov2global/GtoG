// src/app/api/mission/regmission/route.js
import { NextResponse } from "next/server";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { connectMongoDB } from "../../../../../lib/mongodb";
import Plot from "../../../../../models/plots";
import Counter from "../../../../../models/counter";

const s3 = new S3Client({
  region: process.env.REGION_AWS,
  credentials: {
    accessKeyId: process.env.ACCESS_KEY_ID_AWS,
    secretAccessKey: process.env.SECRET_ACCESS_KEY_AWS,
  },
});

async function uploadToS3(file, fileName) {
  if (!file) return null;
  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const bucket = process.env.S3_BUCKET_NAME_AWS;
    if (!bucket) throw new Error("❌ Missing S3_BUCKET_NAME_AWS in env");

    const uploadParams = {
      Bucket: bucket,
      Key: `regplots/${fileName}`,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    };

    await s3.send(new PutObjectCommand(uploadParams));
    return `https://${bucket}.s3.${process.env.REGION_AWS}.amazonaws.com/regplots/${fileName}`;
  } catch (err) {
    console.error("❌ Upload Error:", err.message);
    return null;
  }
}

export async function POST(req) {
  try {
    await connectMongoDB();

    const formData = await req.formData();
    const name = formData.get("name");
    const lat = formData.get("lat");
    const lon = formData.get("lon");
    const plantType = formData.get("plantType");
    const spacing = formData.get("spacing");
    const lineId = formData.get("lineId");

    const generalFiles = [
      formData.get("general1"),
      formData.get("general2"),
      formData.get("general3"),
      formData.get("general4"),
    ].filter(Boolean);

    const treeFile = formData.get("tree");
    const leafFile = formData.get("leaf");
    const fruitFile = formData.get("fruit");

    const now = new Date(new Date().getTime() + 7 * 60 * 60 * 1000);
    const year = String(now.getFullYear()).slice(-2);
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const dateKey = `${now.getFullYear()}${month}${day}`;

    const counter = await Counter.findByIdAndUpdate(
      `regCode-${dateKey}`,
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );

    const runningNumber = String(counter.seq).padStart(5, "0");
    const regCode = `P${year}${month}${day}${runningNumber}`;

    const imageUrls = { general: [], tree: null, leaf: null, fruit: null };
    for (let i = 0; i < generalFiles.length; i++) {
      const url = await uploadToS3(generalFiles[i], `${regCode}_general${i + 1}.jpg`);
      if (url) imageUrls.general.push(url);
    }

    if (treeFile) imageUrls.tree = await uploadToS3(treeFile, `${regCode}_tree.jpg`);
    if (leafFile) imageUrls.leaf = await uploadToS3(leafFile, `${regCode}_leaf.jpg`);
    if (fruitFile) imageUrls.fruit = await uploadToS3(fruitFile, `${regCode}_fruit.jpg`);

    const newPlot = await Plot.create({
      regCode,
      name,
      lat,
      lon,
      plantType,
      spacing,
      lineId,
      images: imageUrls,
    });

    return NextResponse.json({ success: true, regCode, plot: newPlot });
  } catch (err) {
    console.error("❌ API Error:", err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
