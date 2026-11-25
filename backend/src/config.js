// อ่านค่าตั้งค่าทั้งหมดจาก environment variables (ไฟล์ .env) ไว้ที่จุดเดียว
const path = require('path');
require('dotenv').config({ quiet: true });

// ค่าที่ต้องมี ถ้าไม่มีให้หยุดโปรแกรมทันที จะได้รู้ตัวเร็ว
function required(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`ไม่พบค่า ${name} ในไฟล์ .env (ดูตัวอย่างใน .env.example)`);
    process.exit(1);
  }
  return value;
}

module.exports = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: required('DATABASE_URL'),
  jwtSecret: required('JWT_SECRET'),
  cookieSecure: process.env.COOKIE_SECURE === 'true',
  admin: {
    email: process.env.ADMIN_EMAIL,
    password: process.env.ADMIN_PASSWORD,
    name: process.env.ADMIN_NAME || 'ผู้ดูแลระบบ',
  },
  // path แบบ relative นับจากโฟลเดอร์ backend/ (ไม่ขึ้นกับว่ารันคำสั่งจากโฟลเดอร์ไหน)
  uploadDir: path.resolve(__dirname, '..', process.env.UPLOAD_DIR || './uploads'),
};
