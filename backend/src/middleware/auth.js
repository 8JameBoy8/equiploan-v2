// middleware ตรวจการล็อกอินและบทบาท
const jwt = require('jsonwebtoken');
const config = require('../config');

const COOKIE_NAME = 'token';

// อ่าน token จาก cookie แล้วใส่ข้อมูลผู้ใช้ไว้ที่ req.user
// ถ้าไม่มีหรือไม่ถูกต้อง ตอบ 401 (ยังไม่ได้ล็อกอิน)
function requireAuth(req, res, next) {
  const token = req.cookies[COOKIE_NAME];
  if (!token) {
    return res.status(401).json({ error: 'กรุณาเข้าสู่ระบบ' });
  }
  try {
    const payload = jwt.verify(token, config.jwtSecret);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    return res.status(401).json({ error: 'เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่' });
  }
}

// ใช้ต่อจาก requireAuth: อนุญาตเฉพาะบทบาทที่กำหนด ไม่งั้นตอบ 403 (ไม่มีสิทธิ์)
function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ error: 'คุณไม่มีสิทธิ์เข้าถึงส่วนนี้' });
    }
    next();
  };
}

module.exports = { COOKIE_NAME, requireAuth, requireRole };
