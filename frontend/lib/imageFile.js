// ตรวจไฟล์รูปก่อนส่ง (ต้องตรงกับกติกาใน backend/src/upload.js — BE ตรวจซ้ำอีกครั้งเสมอ)
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export const IMAGE_ACCEPT = ALLOWED_TYPES.join(',');

// คืนข้อความ error ถ้าไฟล์ใช้ไม่ได้ หรือคืน '' ถ้าใช้ได้
export function checkImageFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) return 'รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP';
  if (file.size > MAX_SIZE) return 'ไฟล์ใหญ่เกิน 5MB';
  return '';
}
