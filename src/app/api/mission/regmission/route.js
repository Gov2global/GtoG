// api/mission/regmission
import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { connectDB } from "../../../../../lib/mongodb"
import Plot from "../../../../../models/plots" // [CHANGED: แก้ให้ชื่อไฟล์ตรงกับ model จริง]
import Counter from "../../../../../models/counter" 

const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

async function uploadToS3(file, fileName) {
  if (!file) return null

  try {
    const buffer = Buffer.from(await file.arrayBuffer())
    const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME
    if (!bucket) throw new Error("❌ Missing AWS_S3_BUCKET or S3_BUCKET_NAME in env")

    const uploadParams = {
      Bucket: bucket,
      Key: `regplots/${fileName}`,
      Body: buffer,
      ContentType: file.type || "application/octet-stream",
    }

    await s3.send(new PutObjectCommand(uploadParams))
    return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/regplots/${fileName}`
  } catch (err) {
    console.error("❌ Upload Error:", err.message)
    return null
  }
}

export async function POST(req) {
  try {
    await connectDB()

    const formData = await req.formData()
    const name = formData.get("name")
    const lat = formData.get("lat")
    const lon = formData.get("lon")
    const plantType = formData.get("plantType")
    const spacing = formData.get("spacing")
    const lineId = formData.get("lineId")

    const generalFiles = [
      formData.get("general1"),
      formData.get("general2"),
      formData.get("general3"),
      formData.get("general4"),
    ].filter(Boolean)

    const treeFile = formData.get("tree")
    const leafFile = formData.get("leaf")
    const fruitFile = formData.get("fruit")

    // 🆔 [CHANGED: ใช้เวลาประเทศไทย (UTC+7)]
    const now = new Date(new Date().getTime() + 7 * 60 * 60 * 1000) // ✅ เวลาไทย
    const year = String(now.getFullYear()).slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")
    const dateKey = `${now.getFullYear()}${month}${day}`

    const counter = await Counter.findByIdAndUpdate(
      `regCode-${dateKey}`, // [ADDED: key ตัวนับตามวัน]
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    )

    const runningNumber = String(counter.seq).padStart(5, "0")
    const regCode = `P${year}${month}${day}${runningNumber}` // เช่น P25092000001

    // 📤 Upload to S3
    const imageUrls = { general: [], tree: null, leaf: null, fruit: null }

    for (let i = 0; i < generalFiles.length; i++) {
      const url = await uploadToS3(generalFiles[i], `${regCode}_general${i + 1}.jpg`)
      if (url) imageUrls.general.push(url)
    }

    if (treeFile) imageUrls.tree = await uploadToS3(treeFile, `${regCode}_tree.jpg`)
    if (leafFile) imageUrls.leaf = await uploadToS3(leafFile, `${regCode}_leaf.jpg`)
    if (fruitFile) imageUrls.fruit = await uploadToS3(fruitFile, `${regCode}_fruit.jpg`)

    // 💾 Save to DB
    const newPlot = await Plot.create({
      regCode,
      name,
      lat,
      lon,
      plantType,
      spacing,
      lineId,
      images: imageUrls,
    })

    return NextResponse.json({
      success: true,
      regCode,
      plot: newPlot,
    })
  } catch (err) {
    console.error("❌ API Error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}