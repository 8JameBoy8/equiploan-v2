// การเชื่อมต่อ PostgreSQL แบบ pool (ใช้การเชื่อมต่อซ้ำได้ ไม่ต้องเปิดใหม่ทุกครั้ง)
const { Pool } = require('pg');
const config = require('./config');

const pool = new Pool({ connectionString: config.databaseUrl });

// การเชื่อมต่อที่ว่างอยู่หลุด (เช่น DB รีสตาร์ต): แค่บันทึกไว้ ไม่ให้ backend หยุด
// pool จะเชื่อมต่อใหม่เองเมื่อมีคำขอถัดไป
pool.on('error', (err) => {
  console.error('การเชื่อมต่อฐานข้อมูลหลุด:', err.message);
});

module.exports = pool;
