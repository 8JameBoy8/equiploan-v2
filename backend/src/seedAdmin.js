// สร้างบัญชี admin จากค่าใน .env ถ้ายังไม่มีอีเมลนี้ในระบบ (ถ้ามีแล้วจะไม่แก้อะไร)
const bcrypt = require('bcryptjs');
const pool = require('./db');
const config = require('./config');

async function seedAdmin() {
  const { email, password, name } = config.admin;
  if (!email || !password) {
    console.warn('ไม่ได้ตั้ง ADMIN_EMAIL/ADMIN_PASSWORD จึงไม่สร้างบัญชี admin');
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, full_name, role)
     VALUES ($1, $2, $3, 'admin')
     ON CONFLICT (email) DO NOTHING`,
    [email.trim().toLowerCase(), passwordHash, name]
  );
  if (result.rowCount === 1) {
    console.log(`สร้างบัญชี admin แล้ว: ${email}`);
  }
}

module.exports = seedAdmin;
