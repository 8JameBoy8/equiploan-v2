// การอัปโหลดรูป: รับได้เฉพาะ jpg/png/webp ขนาดไม่เกิน 5MB แล้วบันทึกด้วยชื่อไฟล์ที่สุ่มใหม่
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const multer = require('multer');
const config = require('./config');

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_EXT = ['.jpg', '.jpeg', '.png', '.webp'];

// สร้างโฟลเดอร์เก็บรูปถ้ายังไม่มี
fs.mkdirSync(config.uploadDir, { recursive: true });

// error ของเราเอง พร้อมรหัสสถานะ HTTP ที่จะตอบกลับ
class UploadError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// ชั้นที่ 1: ดูนามสกุลและ mimetype ที่เบราว์เซอร์บอกมา (ปลอมได้ จึงมีชั้นที่ 2)
function fileFilter(req, file, cb) {
  const ext = path.extname(file.originalname).toLowerCase();
  if (ALLOWED_MIME.includes(file.mimetype) && ALLOWED_EXT.includes(ext)) {
    cb(null, true);
  } else {
    cb(new UploadError(400, 'รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP'));
  }
}

// เก็บไฟล์ไว้ในหน่วยความจำก่อน (ไม่เกิน 5MB) เพื่อตรวจเนื้อไฟล์ก่อนเขียนลงดิสก์
const multerSingle = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_SIZE, files: 1 },
  fileFilter,
}).single('image');

// middleware สำหรับ route: รับไฟล์ช่อง "image" (ไม่บังคับ) แล้วแปลง error ให้เป็นข้อความที่เข้าใจง่าย
function acceptImage(req, res, next) {
  multerSingle(req, res, (err) => {
    if (!err) return next();
    if (err instanceof UploadError) {
      return res.status(err.status).json({ error: err.message });
    }
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(413).json({ error: 'ไฟล์ใหญ่เกิน 5MB' });
    }
    return res.status(400).json({ error: 'อัปโหลดไฟล์ไม่สำเร็จ' });
  });
}

// ชั้นที่ 2: ดูไบต์แรกๆ ของไฟล์ (magic bytes) ว่าเป็นรูปจริง คืนค่านามสกุลที่ถูกต้อง หรือ null
function detectImageType(buffer) {
  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return '.jpg';
  }
  const pngSignature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (buffer.length >= 8 && buffer.subarray(0, 8).equals(pngSignature)) {
    return '.png';
  }
  if (
    buffer.length >= 12 &&
    buffer.toString('ascii', 0, 4) === 'RIFF' &&
    buffer.toString('ascii', 8, 12) === 'WEBP'
  ) {
    return '.webp';
  }
  return null;
}

// บันทึกไฟล์ลงโฟลเดอร์อัปโหลดด้วยชื่อสุ่ม คืนค่าชื่อไฟล์ (เก็บค่านี้ใน DB)
// ถ้าเนื้อไฟล์ไม่ใช่รูปจริง จะ throw UploadError 400
function saveImage(file) {
  const ext = detectImageType(file.buffer);
  if (!ext) {
    throw new UploadError(400, 'ไฟล์นี้ไม่ใช่รูป JPG, PNG หรือ WEBP จริง');
  }
  const filename = crypto.randomUUID() + ext;
  fs.writeFileSync(path.join(config.uploadDir, filename), file.buffer);
  return filename;
}

// ลบไฟล์รูปเก่า (ถ้าไม่มีไฟล์อยู่แล้วก็ไม่เป็นไร)
function deleteImage(filename) {
  if (!filename) return;
  fs.rm(path.join(config.uploadDir, filename), { force: true }, () => {});
}

// path เต็มของไฟล์รูป ใช้ตอนส่งไฟล์กลับไปแสดง
function imageFullPath(filename) {
  return path.join(config.uploadDir, filename);
}

module.exports = { UploadError, acceptImage, saveImage, deleteImage, imageFullPath };
