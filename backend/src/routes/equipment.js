// endpoint เกี่ยวกับอุปกรณ์
//   ดูรายการ/ดูรายชิ้น/ดูรูป: ผู้ที่ล็อกอินแล้วทุกคน
//   เพิ่ม/แก้/ลบ: admin เท่านั้น
// อุปกรณ์ที่ถูกลบ (deleted_at ไม่เป็น NULL) จะไม่แสดงในรายการและแก้ไม่ได้
//   แต่รูปยังเปิดได้ เพื่อให้ประวัติคำขอยืมเก่ายังแสดงรูปได้
const express = require('express');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { UploadError, acceptImage, saveImage, deleteImage, imageFullPath } = require('../upload');

const router = express.Router();

// ทุก endpoint ในไฟล์นี้ต้องล็อกอินก่อน
router.use(requireAuth);

// SQL ดึงอุปกรณ์พร้อมสถานะ: ถ้ามีคำขอที่ approved อยู่ = ถูกยืม (borrowed) ไม่งั้น = ว่าง (available)
const SELECT_EQUIPMENT = `
  SELECT e.*,
         EXISTS (SELECT 1 FROM loans l WHERE l.equipment_id = e.id AND l.status = 'approved') AS borrowed
  FROM equipment e`;

// แปลงแถวจาก DB เป็นข้อมูลที่ส่งให้ FE
function toPublicEquipment(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    description: row.description || '',
    status: row.borrowed ? 'borrowed' : 'available',
    // ใส่ ?v=เวลาแก้ไขล่าสุด เพื่อให้เบราว์เซอร์โหลดรูปใหม่เมื่อเปลี่ยนรูป
    imageUrl: row.image_path
      ? `/api/equipment/${row.id}/image?v=${new Date(row.updated_at).getTime()}`
      : null,
  };
}

// ตรวจข้อความในฟอร์ม คืนค่า { data } ถ้าถูกต้อง หรือ { error } ถ้าผิด
function validateFields(body = {}) {
  const name = String(body.name || '').trim();
  const category = String(body.category || '').trim();
  const description = String(body.description || '').trim();

  if (!name || name.length > 100) return { error: 'กรุณากรอกชื่ออุปกรณ์ (ไม่เกิน 100 ตัวอักษร)' };
  if (!category || category.length > 50) return { error: 'กรุณากรอกหมวด (ไม่เกิน 50 ตัวอักษร)' };
  if (description.length > 1000) return { error: 'รายละเอียดยาวเกิน 1000 ตัวอักษร' };
  return { data: { name, category, description: description || null } };
}

// แปลง :id ให้เป็นตัวเลข ถ้าไม่ใช่ตัวเลขคืนค่า null
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// GET /api/equipment — รายการอุปกรณ์ทั้งหมด (ไม่รวมที่ถูกลบ)
router.get('/', async (req, res) => {
  const { rows } = await pool.query(
    `${SELECT_EQUIPMENT} WHERE e.deleted_at IS NULL ORDER BY e.category, e.name`
  );
  res.json({ equipment: rows.map(toPublicEquipment) });
});

// GET /api/equipment/:id — อุปกรณ์หนึ่งชิ้น
router.get('/:id', async (req, res) => {
  const id = parseId(req.params.id);
  const { rows } = await pool.query(`${SELECT_EQUIPMENT} WHERE e.id = $1 AND e.deleted_at IS NULL`, [id]);
  if (rows.length === 0) return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
  res.json({ equipment: toPublicEquipment(rows[0]) });
});

// GET /api/equipment/:id/image — ส่งไฟล์รูปของอุปกรณ์
router.get('/:id/image', async (req, res) => {
  const id = parseId(req.params.id);
  const { rows } = await pool.query('SELECT image_path FROM equipment WHERE id = $1', [id]);
  if (rows.length === 0 || !rows[0].image_path) {
    return res.status(404).json({ error: 'ไม่พบรูป' });
  }
  res.set('X-Content-Type-Options', 'nosniff');
  res.sendFile(imageFullPath(rows[0].image_path), (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'ไม่พบไฟล์รูป' });
  });
});

// POST /api/equipment — เพิ่มอุปกรณ์ (admin) ส่งเป็น multipart/form-data
router.post('/', requireRole('admin'), acceptImage, async (req, res) => {
  const { data, error } = validateFields(req.body);
  if (error) return res.status(400).json({ error });

  let imagePath = null;
  try {
    if (req.file) imagePath = saveImage(req.file);
  } catch (err) {
    if (err instanceof UploadError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const { rows } = await pool.query(
    `INSERT INTO equipment (name, category, description, image_path)
     VALUES ($1, $2, $3, $4) RETURNING *, false AS borrowed`,
    [data.name, data.category, data.description, imagePath]
  );
  res.status(201).json({ equipment: toPublicEquipment(rows[0]) });
});

// PUT /api/equipment/:id — แก้ไขอุปกรณ์ (admin) ถ้าแนบรูปใหม่จะแทนรูปเดิม
router.put('/:id', requireRole('admin'), acceptImage, async (req, res) => {
  const id = parseId(req.params.id);
  const existing = await pool.query(
    'SELECT image_path FROM equipment WHERE id = $1 AND deleted_at IS NULL',
    [id]
  );
  if (existing.rows.length === 0) return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });

  const { data, error } = validateFields(req.body);
  if (error) return res.status(400).json({ error });

  const oldImage = existing.rows[0].image_path;
  let imagePath = oldImage;
  try {
    if (req.file) imagePath = saveImage(req.file);
  } catch (err) {
    if (err instanceof UploadError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  await pool.query(
    `UPDATE equipment
     SET name = $1, category = $2, description = $3, image_path = $4, updated_at = now()
     WHERE id = $5`,
    [data.name, data.category, data.description, imagePath, id]
  );

  // บันทึก DB สำเร็จแล้วค่อยลบรูปเก่า (ถ้ามีการเปลี่ยนรูป)
  if (imagePath !== oldImage) deleteImage(oldImage);

  const { rows } = await pool.query(`${SELECT_EQUIPMENT} WHERE e.id = $1`, [id]);
  res.json({ equipment: toPublicEquipment(rows[0]) });
});

// DELETE /api/equipment/:id — ลบอุปกรณ์ (admin) แบบ soft delete
//   ลบไม่ได้ถ้ายังมีคำขอที่รออนุมัติหรือถูกยืมอยู่ ต้องจัดการคำขอนั้นก่อน
//   ไม่ลบไฟล์รูป เพราะประวัติคำขอเก่ายังใช้แสดงรูปอยู่
router.delete('/:id', requireRole('admin'), async (req, res) => {
  const id = parseId(req.params.id);
  const existing = await pool.query('SELECT 1 FROM equipment WHERE id = $1 AND deleted_at IS NULL', [id]);
  if (existing.rows.length === 0) return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });

  // NOT EXISTS อยู่ในคำสั่ง UPDATE เลย กันกรณีมีคำขอใหม่เข้ามาระหว่างตรวจกับลบ
  const result = await pool.query(
    `UPDATE equipment SET deleted_at = now(), updated_at = now()
     WHERE id = $1 AND deleted_at IS NULL
       AND NOT EXISTS (
         SELECT 1 FROM loans WHERE equipment_id = $1 AND status IN ('requested', 'approved')
       )`,
    [id]
  );
  if (result.rowCount === 0) {
    return res.status(409).json({
      error: 'ลบไม่ได้ เพราะอุปกรณ์นี้มีคำขอที่รออนุมัติหรือถูกยืมอยู่ กรุณาจัดการคำขอนั้นก่อน',
    });
  }
  res.json({ ok: true });
});

module.exports = router;
