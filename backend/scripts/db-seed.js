// ใส่ข้อมูลสมมติอุปกรณ์ 10 ชิ้น (เฉพาะตอนที่ตาราง equipment ยังว่าง จึงรันซ้ำได้ ไม่ซ้อน)
// วิธีใช้: npm run db:seed
const pool = require('../src/db');

const SAMPLE_EQUIPMENT = [
  { name: 'โน้ตบุ๊ก Lenovo ThinkPad', category: 'อิเล็กทรอนิกส์', description: 'สำหรับทำงานนำเสนอและกิจกรรมชมรม' },
  { name: 'โปรเจกเตอร์ Epson', category: 'อิเล็กทรอนิกส์', description: 'พร้อมสาย HDMI ยาว 3 เมตร' },
  { name: 'ลำโพงบลูทูธ JBL', category: 'อิเล็กทรอนิกส์', description: 'แบตเตอรี่ใช้งานได้ประมาณ 10 ชั่วโมง' },
  { name: 'กล้อง Canon EOS 200D', category: 'กล้องและสื่อ', description: 'พร้อมเลนส์ kit 18-55mm และการ์ด 64GB' },
  { name: 'ขาตั้งกล้อง', category: 'กล้องและสื่อ', description: 'ปรับความสูงได้ถึง 160 ซม.' },
  { name: 'ไมโครโฟนไร้สาย', category: 'กล้องและสื่อ', description: 'ชุดไมค์ 2 ตัวพร้อมตัวรับสัญญาณ' },
  { name: 'กีตาร์โปร่ง Yamaha', category: 'ดนตรี', description: 'พร้อมกระเป๋าใส่กีตาร์' },
  { name: 'คีย์บอร์ดไฟฟ้า Casio', category: 'ดนตรี', description: '61 คีย์ พร้อมอแดปเตอร์' },
  { name: 'ลูกฟุตบอล', category: 'กีฬา', description: 'เบอร์ 5 สำหรับสนามหญ้า' },
  { name: 'ไม้แบดมินตัน (คู่)', category: 'กีฬา', description: 'ไม้ 2 อันพร้อมลูกขนไก่ 3 ลูก' },
];

async function main() {
  const { rows } = await pool.query('SELECT COUNT(*)::int AS count FROM equipment');
  if (rows[0].count > 0) {
    console.log(`มีอุปกรณ์อยู่แล้ว ${rows[0].count} ชิ้น จึงไม่เพิ่มข้อมูลสมมติ`);
  } else {
    for (const item of SAMPLE_EQUIPMENT) {
      await pool.query(
        'INSERT INTO equipment (name, category, description) VALUES ($1, $2, $3)',
        [item.name, item.category, item.description]
      );
    }
    console.log(`เพิ่มอุปกรณ์สมมติ ${SAMPLE_EQUIPMENT.length} ชิ้นแล้ว`);
  }
  await pool.end();
}

main().catch((err) => {
  console.error('เพิ่มข้อมูลสมมติไม่สำเร็จ:', err.message);
  process.exit(1);
});
