// api/mission/regmission
import { NextResponse } from "next/server"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { connectDB } from "../../../../../lib/mongodb"
import Plot from "../../../../../models/plots" // [CHANGED: แก้ให้ชื่อไฟล์ตรงกับ model จริง]
// 🔧 Config S3 Client
const s3 = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

// 🔧 ฟังก์ชันอัปโหลดไฟล์ไป S3
async function uploadToS3(file, fileName) {
  if (!file || typeof file.arrayBuffer !== "function") return null

  const bucket = process.env.AWS_S3_BUCKET || process.env.S3_BUCKET_NAME
  if (!bucket) throw new Error("❌ Missing AWS_S3_BUCKET or S3_BUCKET_NAME in environment variables")

  const buffer = Buffer.from(await file.arrayBuffer())

  const uploadParams = {
    Bucket: bucket,
    Key: `regplots/${fileName}`, // ✅ แก้ path ให้สะกดถูก
    Body: buffer,
    ContentType: file.type || "application/octet-stream",
  }

  await s3.send(new PutObjectCommand(uploadParams))

  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/regplots/${fileName}`
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

    // 📸 รับไฟล์จาก formData
    const generalFiles = [
      formData.get("general1"),
      formData.get("general2"),
      formData.get("general3"),
      formData.get("general4"),
    ].filter(Boolean)

    const treeFile = formData.get("tree")
    const leafFile = formData.get("leaf")
    const fruitFile = formData.get("fruit")

    // 🆔 สร้างรหัส PYYMMDDxxxxx
    const now = new Date()
    const year = String(now.getFullYear()).slice(-2)
    const month = String(now.getMonth() + 1).padStart(2, "0")
    const day = String(now.getDate()).padStart(2, "0")

    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const endOfDay = new Date(startOfDay)
    endOfDay.setDate(endOfDay.getDate() + 1)

    const countToday = await Plot.countDocuments({
      createdAt: { $gte: startOfDay, $lt: endOfDay },
    })

    const runningNumber = String(countToday + 1).padStart(5, "0")
    const regCode = `P${year}${month}${day}${runningNumber}`

    // 📤 อัปโหลดรูปไป S3
    const imageUrls = { general: [], tree: null, leaf: null, fruit: null }

    for (let i = 0; i < generalFiles.length; i++) {
      const url = await uploadToS3(generalFiles[i], `${regCode}_general${i + 1}.jpg`)
      if (url) imageUrls.general.push(url)
    }

    if (treeFile) imageUrls.tree = await uploadToS3(treeFile, `${regCode}_tree.jpg`)
    if (leafFile) imageUrls.leaf = await uploadToS3(leafFile, `${regCode}_leaf.jpg`)
    if (fruitFile) imageUrls.fruit = await uploadToS3(fruitFile, `${regCode}_fruit.jpg`)

    // 💾 บันทึก DB
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
      plot: {
        id: newPlot._id,
        regCode: newPlot.regCode,
        name: newPlot.name,
        lat: newPlot.lat,
        lon: newPlot.lon,
        plantType: newPlot.plantType,
        spacing: newPlot.spacing,
        lineId: newPlot.lineId,
        images: newPlot.images,
        createdAt: newPlot.createdAt,
      },
    })
  } catch (err) {
    console.error("❌ Error:", err)
    return NextResponse.json({ success: false, error: err.message }, { status: 500 })
  }
}