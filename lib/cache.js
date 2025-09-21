// lib/cache.js
const cache = Object.create(null);

/**
 * บันทึกข้อมูลลง cache
 * @param {string} key - คีย์ของข้อมูล
 * @param {*} data - ข้อมูลที่ต้องการเก็บ
 * @param {number} ttlMs - อายุข้อมูล (ms)
 */
export function setCache(key, data, ttlMs = 60 * 1000) {
  try {
    cache[key] = {
      data,
      expiry: Date.now() + ttlMs,
    };
  } catch (err) {
    console.error("❌ setCache error:", err);
  }
}

/**
 * อ่านข้อมูลจาก cache
 * @param {string} key - คีย์ของข้อมูล
 * @returns {*} data หรือ null ถ้าไม่เจอ/หมดอายุ
 */
export function getCache(key) {
  try {
    const item = cache[key];
    if (!item) return null;

    if (Date.now() > item.expiry) {
      delete cache[key];
      return null;
    }

    return item.data;
  } catch (err) {
    console.error("❌ getCache error:", err);
    return null;
  }
}

/**
 * ลบข้อมูลจาก cache ตาม key
 * @param {string} key
 */
export function deleteCache(key) {
  try {
    delete cache[key];
  } catch (err) {
    console.error("❌ deleteCache error:", err);
  }
}

/**
 * ลบ cache ทั้งหมด
 */
export function clearCache() {
  try {
    Object.keys(cache).forEach((k) => delete cache[k]);
    console.log("🧹 Cache cleared");
  } catch (err) {
    console.error("❌ clearCache error:", err);
  }
}
