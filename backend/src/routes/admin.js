// endpoint สำหรับ admin เท่านั้น
// ตอนนี้มีแค่ /ping ไว้ทดสอบการตรวจสิทธิ์ เฟสถัดไปจะเพิ่มการจัดการอุปกรณ์และคำขอยืม
const express = require('express');
const { requireAuth, requireRole } = require('../middleware/auth');

const router = express.Router();

// ทุก endpoint ในไฟล์นี้ต้องล็อกอิน และต้องเป็น admin
router.use(requireAuth, requireRole('admin'));

// GET /api/admin/ping
router.get('/ping', (req, res) => {
  res.json({ ok: true, message: 'คุณเป็น admin' });
});

module.exports = router;
