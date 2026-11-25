// จุดเริ่มต้นของ backend: สร้าง admin (ถ้ายังไม่มี) แล้วเปิดพอร์ต
const app = require('./app');
const config = require('./config');
const seedAdmin = require('./seedAdmin');

async function start() {
  try {
    await seedAdmin();
  } catch (err) {
    // ถ้า DB ยังไม่พร้อม ให้เซิร์ฟเวอร์ยังเปิดได้ (/readyz จะตอบ 503 ให้รู้)
    console.error('สร้างบัญชี admin ไม่สำเร็จ:', err.message || err.code);
  }
  app.listen(config.port, () => {
    console.log(`Backend ทำงานที่ http://localhost:${config.port}`);
  });
}

start();
