// สร้างตารางในฐานข้อมูลจากไฟล์ db/schema.sql (รันซ้ำได้)
// วิธีใช้: npm run db:init
const fs = require('fs');
const path = require('path');
const pool = require('../src/db');

async function main() {
  const schemaPath = path.join(__dirname, '..', '..', 'db', 'schema.sql');
  const sql = fs.readFileSync(schemaPath, 'utf8');
  await pool.query(sql);
  console.log('สร้างตารางเรียบร้อย');
  await pool.end();
}

main().catch((err) => {
  console.error('สร้างตารางไม่สำเร็จ:', err.message);
  process.exit(1);
});
