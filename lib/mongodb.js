// import mongoose from "mongoose";

// const connectMongoDB = async () => {
//   if (mongoose.connection.readyState >= 1) {
//     return;
//   }
//   await mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true,
//   });
// };

// export { connectMongoDB };


// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI;
// if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');

// let cached = global._mongoose;
// if (!cached) cached = global._mongoose = { conn: null, promise: null };

// export async function connectDB() {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     mongoose.set('strictQuery', true);
//     cached.promise = mongoose.connect(MONGODB_URI, {
//       bufferCommands: false
//     }).then((m) => m);
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }




// import mongoose from "mongoose";

// const MONGODB_URI = process.env.MONGODB_URI;
// if (!MONGODB_URI) throw new Error("Missing MONGODB_URI");

// // cache การเชื่อมต่อไว้บน global ป้องกันเปิดหลายครั้งใน dev/serverless
// let cached = global._mongoose;
// if (!cached) cached = global._mongoose = { conn: null, promise: null };

// async function _connect() {
//   if (cached.conn) return cached.conn;

//   if (!cached.promise) {
//     // ไม่จำเป็นต้องใส่ useNewUrlParser/useUnifiedTopology ใน Mongoose >= v6
//     mongoose.set("strictQuery", true);
//     cached.promise = mongoose
//       .connect(MONGODB_URI, { bufferCommands: false, serverSelectionTimeoutMS: 10000, maxPoolSize: 5 })
//       .then((m) => m);
//   }
//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// // ✅ ตั้งชื่อหลักเป็น connectDB
// export async function connectDB() {
//   return _connect();
// }

// // ✅ เผื่อโค้ดเดิมที่ import { connectMongoDB } ไว้แล้ว
// export const connectMongoDB = connectDB;

// // (ออปชัน) รองรับ default import ด้วย
// export default connectDB;


// lib/mongodb.js
// import mongoose from 'mongoose';

// const MONGODB_URI = process.env.MONGODB_URI;
// if (!MONGODB_URI) throw new Error('Missing MONGODB_URI');

// // ใช้ globalThis ปลอดภัยกับ ESM/TS
// let cached = globalThis._mongooseCached;
// if (!cached) cached = globalThis._mongooseCached = { conn: null, promise: null };

// const isProd = process.env.NODE_ENV === 'production';

// export async function connectDB() {
//   if (cached.conn) return cached.conn;
//   if (!cached.promise) {
//     // ตั้งค่าทั่วไป
//     mongoose.set('strictQuery', true);
//     // ปิด autoIndex ใน prod เพื่อประสิทธิภาพ (เปิดใน dev เพื่อพัฒนา schema สบายๆ)
//     mongoose.set('autoIndex', !isProd);

//     const t0 = Date.now();
//     cached.promise = mongoose
//       .connect(MONGODB_URI, {
//         // serverless-friendly: pool ไม่ใหญ่, ปล่อย idle เร็ว
//         maxPoolSize: 10,           // เดิม 5 ก็ได้ ถ้าทราฟฟิกน้อย
//         minPoolSize: 0,
//         maxIdleTimeMS: 30_000,     // คอนเนกชันว่างเกิน 30s ปล่อยทิ้ง
//         socketTimeoutMS: 20_000,
//         serverSelectionTimeoutMS: 10_000,
//         bufferCommands: false,
//         // เสริมความเสถียรบน Atlas / MongoDB 6+
//         appName: 'nextjs-app',
//         serverApi: { version: '1', strict: false, deprecationErrors: true },
//       })
//       .then((m) => {
//         if (!isProd) {
//           const took = Date.now() - t0;
//           // eslint-disable-next-line no-console
//           console.log(`[mongo] connected in ${took}ms, state=${m.connection.readyState}`);
//         }
//         return m;
//       })
//       .catch((err) => {
//         // ถ้าพลาด ให้ล้าง promise เพื่อให้ลองใหม่ครั้งถัดไปได้
//         cached.promise = null;
//         throw err;
//       });

//     // dev logs
//     if (!isProd) {
//       mongoose.connection.on('error', (e) => console.error('[mongo] error:', e?.message));
//       mongoose.connection.on('disconnected', () => console.warn('[mongo] disconnected'));
//     }
//   }

//   cached.conn = await cached.promise;
//   return cached.conn;
// }

// // alias ให้โค้ดเดิมใช้ต่อได้
// export const connectMongoDB = connectDB;
// export default connectDB;


// lib/mongodb.js
import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("❌ Missing MONGODB_URI in .env");

let cached = global._mongoose;
if (!cached) cached = global._mongoose = { conn: null, promise: null };

export async function connectMongoDB() {
  if (cached.conn) return cached.conn;

  if (!cached.promise) {
    mongoose.set("strictQuery", true);
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    }).then((m) => m);
  }

  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectMongoDB;