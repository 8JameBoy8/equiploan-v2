// health check สำหรับตรวจสถานะเซิร์ฟเวอร์ (เตรียมไว้ใช้กับ probes ตอน deploy)
const express = require('express');
const pool = require('../db');

const router = express.Router();

// GET /healthz — เซิร์ฟเวอร์ยังทำงานอยู่หรือไม่ (ไม่เช็ก DB)
router.get('/healthz', (req, res) => {
  res.json({ status: 'ok' });
});

// GET /readyz — พร้อมรับงานหรือไม่ (ต้องเชื่อมต่อ DB ได้)
router.get('/readyz', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ready' });
  } catch {
    res.status(503).json({ status: 'not ready', error: 'เชื่อมต่อฐานข้อมูลไม่ได้' });
  }
});

module.exports = router;
