const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ---------- ตั้งค่า ----------
const inputPath = path.resolve('../../../../../public/richmenu/All_RichManu.jpg');
const outputDir = path.resolve('../../../../../public/richmenu/');
const outputFileName = 'All_RichManu_1mb.png';
const outputPath = path.join(outputDir, outputFileName);
const MAX_SIZE = 1048576; // 1MB

async function compressTo1MB() {
  try {
    const metadata = await sharp(inputPath).metadata();
    console.log(`📏 Original size: ${metadata.width}x${metadata.height}`);

    let quality = 90;
    let buffer;

    while (quality >= 40) {
      buffer = await sharp(inputPath)
        .resize({
          width: 2500,
          height: 843,
          fit: 'inside', // ป้องกันไม่ให้ภาพโดนตัด
        })
        .png({
          compressionLevel: 9,
          quality,
          adaptiveFiltering: true,
        })
        .toBuffer();

      console.log(`🔄 Trying quality ${quality}: ${(buffer.length / 1024).toFixed(2)} KB`);

      if (buffer.length <= MAX_SIZE) break;
      quality -= 10;
    }

    if (buffer.length > MAX_SIZE) {
      console.log('❌ ลด quality จนสุดแล้วยังเกิน 1 MB');
      return;
    }

    fs.writeFileSync(outputPath, buffer);
    console.log(`✅ Save Success: ${outputPath} (${(buffer.length / 1024).toFixed(2)} KB, quality ${quality})`);
  } catch (err) {
    console.error('❌ Compress error:', err);
  }
}

compressTo1MB();
