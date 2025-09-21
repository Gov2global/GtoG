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


import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI;
if (!MONGODB_URI) throw new Error("❌ Missing MONGODB_URI");

let cached = globalThis._mongooseCached;
if (!cached) {
  cached = globalThis._mongooseCached = { conn: null, promise: null };
}

export async function connectMongoDB() {
  console.log("🔍 [mongo] state:", mongoose.connection.readyState);

  if (cached.conn && mongoose.connection.readyState === 1) {
    return cached.conn;
  }

  if (mongoose.connection.readyState !== 0) {
    console.log("⚠️ [mongo] resetting stale connection...");
    await mongoose.disconnect();
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      maxPoolSize: 20,
      minPoolSize: 0,
      maxIdleTimeMS: 120_000,
      socketTimeoutMS: 30_000,
      serverSelectionTimeoutMS: 20_000,
      bufferCommands: false,
    })
      .then((m) => {
        console.log("✅ [mongo] connected:", m.connection.host);
        cached.conn = m;
        return m;
      })
      .catch((err) => {
        cached.promise = null;
        throw err;
      });
  }

  cached.conn = await cached.promise;

  // 👇 เพิ่มเช็ก state หลัง connect
  if (mongoose.connection.readyState !== 1) {
    throw new Error("❌ MongoDB not in connected state after connect");
  }

  return cached.conn;
}

export default connectMongoDB;
