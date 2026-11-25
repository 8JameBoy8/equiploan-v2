// ประกอบแอป Express: middleware ทั่วไป + routes ทั้งหมด
const express = require('express');
const cookieParser = require('cookie-parser');

const healthRoutes = require('./routes/health');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const equipmentRoutes = require('./routes/equipment');
const loanRoutes = require('./routes/loans');

const app = express();

app.use(express.json({ limit: '100kb' })); // อ่าน body ที่เป็น JSON
app.use(cookieParser());                    // อ่าน cookie ให้อยู่ใน req.cookies

app.use(healthRoutes);                      // /healthz, /readyz
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/loans', loanRoutes);

// ไม่พบ endpoint
app.use((req, res) => {
  res.status(404).json({ error: 'ไม่พบ endpoint นี้' });
});

// จัดการ error ที่ไม่ได้คาดไว้ (Express 5 ส่ง error จาก async handler มาที่นี่ให้เอง)
app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'เกิดข้อผิดพลาดในเซิร์ฟเวอร์' });
});

module.exports = app;
