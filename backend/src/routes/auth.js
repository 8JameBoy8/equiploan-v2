// endpoint เกี่ยวกับบัญชีผู้ใช้: สมัคร, ล็อกอิน, ล็อกเอาท์, ดูข้อมูลตัวเอง
const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../db');
const config = require('../config');
const { COOKIE_NAME, requireAuth } = require('../middleware/auth');

const router = express.Router();

const SESSION_DAYS = 7;
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// สร้าง token แล้วเก็บใน httpOnly cookie (JavaScript ฝั่งเบราว์เซอร์อ่านไม่ได้)
function setSessionCookie(res, user) {
  const token = jwt.sign({ id: user.id, role: user.role }, config.jwtSecret, {
    expiresIn: `${SESSION_DAYS}d`,
  });
  res.cookie(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: config.cookieSecure,
    maxAge: SESSION_DAYS * 24 * 60 * 60 * 1000,
  });
}

// แปลงแถวจาก DB เป็นข้อมูลที่ส่งให้ FE (ไม่ส่ง password_hash ออกไป)
function toPublicUser(row) {
  return { id: row.id, email: row.email, fullName: row.full_name, role: row.role };
}

// POST /api/auth/register — สมัครสมาชิก (ได้บทบาท member เสมอ) แล้วล็อกอินให้ทันที
router.post('/register', async (req, res) => {
  const body = req.body || {}; // Express 5: ถ้าไม่มี body จะเป็น undefined
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const fullName = String(body.fullName || '').trim();

  if (!EMAIL_PATTERN.test(email)) {
    return res.status(400).json({ error: 'รูปแบบอีเมลไม่ถูกต้อง' });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร' });
  }
  if (!fullName || fullName.length > 100) {
    return res.status(400).json({ error: 'กรุณากรอกชื่อ (ไม่เกิน 100 ตัวอักษร)' });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  try {
    const result = await pool.query(
      `INSERT INTO users (email, password_hash, full_name, role)
       VALUES ($1, $2, $3, 'member')
       RETURNING id, email, full_name, role`,
      [email, passwordHash, fullName]
    );
    const user = result.rows[0];
    setSessionCookie(res, user);
    res.status(201).json({ user: toPublicUser(user) });
  } catch (err) {
    // 23505 = ค่าซ้ำกับ UNIQUE (อีเมลนี้มีคนใช้แล้ว)
    if (err.code === '23505') {
      return res.status(409).json({ error: 'อีเมลนี้ถูกใช้สมัครแล้ว' });
    }
    throw err;
  }
});

// POST /api/auth/login — ตรวจอีเมลและรหัสผ่าน ถ้าถูกต้องตั้ง cookie
router.post('/login', async (req, res) => {
  const body = req.body || {};
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');

  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  const user = result.rows[0];

  // ใช้ข้อความเดียวกันทั้งกรณีไม่มีอีเมลและรหัสผิด เพื่อไม่บอกใบ้ว่าอีเมลไหนมีในระบบ
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    return res.status(401).json({ error: 'อีเมลหรือรหัสผ่านไม่ถูกต้อง' });
  }

  setSessionCookie(res, user);
  res.json({ user: toPublicUser(user) });
});

// POST /api/auth/logout — ลบ cookie
router.post('/logout', (req, res) => {
  res.clearCookie(COOKIE_NAME, { httpOnly: true, sameSite: 'lax', secure: config.cookieSecure });
  res.json({ ok: true });
});

// GET /api/auth/me — ข้อมูลของผู้ที่ล็อกอินอยู่ (อ่านจาก DB เพื่อให้เป็นค่าล่าสุด)
router.get('/me', requireAuth, async (req, res) => {
  const result = await pool.query(
    'SELECT id, email, full_name, role FROM users WHERE id = $1',
    [req.user.id]
  );
  if (result.rows.length === 0) {
    return res.status(401).json({ error: 'ไม่พบผู้ใช้ กรุณาเข้าสู่ระบบใหม่' });
  }
  res.json({ user: toPublicUser(result.rows[0]) });
});

module.exports = router;
