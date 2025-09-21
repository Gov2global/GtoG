// lib/cache.js
const cache = {};

/**
 * เก็บค่าเข้า cache
 * @param {string} key - ชื่อ key
 * @param {any} data - ข้อมูลที่จะเก็บ
 * @param {number} ttlMs - เวลาเก็บ (ms)
 */
export function setCache(key, data, ttlMs) {
  try {
    cache[key] = {
      data,
      expiry: Date.now() + ttlMs,
    };
    console.log(`🗄️ [cache:set] key=${key}, ttl=${ttlMs}ms`);
  } catch (err) {
    console.error("❌ [cache:set] error:", err);
  }
}

/**
 * ดึงค่าจาก cache
 * @param {string} key - ชื่อ key
 * @returns {any|null}
 */
export function getCache(key) {
  try {
    const item = cache[key];
    if (!item) {
      console.log(`⚠️ [cache:get] key=${key} not found`);
      return null;
    }

    if (Date.now() > item.expiry) {
      console.log(`⏰ [cache:get] key=${key} expired`);
      delete cache[key];
      return null;
    }

    console.log(`✅ [cache:get] key=${key} hit`);
    return item.data;
  } catch (err) {
    console.error("❌ [cache:get] error:", err);
    return null;
  }
}

/**
 * ลบค่าใน cache
 * @param {string} key - ชื่อ key
 */
export function clearCache(key) {
  if (cache[key]) {
    delete cache[key];
    console.log(`🧹 [cache:clear] key=${key} removed`);
  }
}

/**
 * ล้าง cache ทั้งหมด
 */
export function clearAllCache() {
  Object.keys(cache).forEach((key) => delete cache[key]);
  console.log("🧹 [cache:clearAll] cache cleared");
}
