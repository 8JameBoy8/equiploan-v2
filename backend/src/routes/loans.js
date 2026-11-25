// endpoint เกี่ยวกับคำขอยืม-คืน
// สถานะ: requested -> approved หรือ rejected -> (approved เท่านั้น) returned
const express = require('express');
const pool = require('../db');
const { requireAuth, requireRole } = require('../middleware/auth');
const { UploadError, acceptImage, saveImage, deleteImage, imageFullPath } = require('../upload');

const router = express.Router();

// ทุก endpoint ในไฟล์นี้ต้องล็อกอินก่อน
router.use(requireAuth);

const MAX_PURPOSE = 500;

// SQL ดึงคำขอพร้อมชื่อผู้ยืมและข้อมูลอุปกรณ์
const SELECT_LOANS = `
  SELECT l.*, u.full_name AS borrower_name, u.email AS borrower_email,
         e.name AS equipment_name, e.image_path AS equipment_image, e.updated_at AS equipment_updated_at
  FROM loans l
  JOIN users u ON u.id = l.user_id
  JOIN equipment e ON e.id = l.equipment_id`;

// แปลงแถวจาก DB เป็นข้อมูลที่ส่งให้ FE
function toPublicLoan(row) {
  return {
    id: row.id,
    status: row.status,
    purpose: row.purpose || '',
    borrower: { id: row.user_id, name: row.borrower_name, email: row.borrower_email },
    equipment: {
      id: row.equipment_id,
      name: row.equipment_name,
      imageUrl: row.equipment_image
        ? `/api/equipment/${row.equipment_id}/image?v=${new Date(row.equipment_updated_at).getTime()}`
        : null,
    },
    returnImageUrl: row.return_image_path ? `/api/loans/${row.id}/return-image` : null,
    requestedAt: row.requested_at,
    decidedAt: row.decided_at,
    returnedAt: row.returned_at,
  };
}

// แปลง :id ให้เป็นตัวเลข ถ้าไม่ใช่ตัวเลขคืนค่า null
function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// ดึงคำขอหนึ่งรายการ (ไม่เจอคืน undefined)
async function findLoan(id) {
  const { rows } = await pool.query(`${SELECT_LOANS} WHERE l.id = $1`, [id]);
  return rows[0];
}

// GET /api/loans — member เห็นของตัวเอง, admin เห็นทั้งหมด (ใหม่สุดก่อน)
router.get('/', async (req, res) => {
  const { rows } =
    req.user.role === 'admin'
      ? await pool.query(`${SELECT_LOANS} ORDER BY l.requested_at DESC`)
      : await pool.query(`${SELECT_LOANS} WHERE l.user_id = $1 ORDER BY l.requested_at DESC`, [req.user.id]);
  res.json({ loans: rows.map(toPublicLoan) });
});

// POST /api/loans — member ส่งคำขอยืม { equipmentId, purpose }
router.post('/', requireRole('member'), async (req, res) => {
  const body = req.body || {};
  const equipmentId = parseId(body.equipmentId);
  const purpose = String(body.purpose || '').trim();

  // นับเป็นจำนวนตัวอักษรจริง ([...ข้อความ] แยกทีละตัวอักษร)
  if ([...purpose].length > MAX_PURPOSE) {
    return res.status(400).json({ error: `วัตถุประสงค์ยาวเกิน ${MAX_PURPOSE} ตัวอักษร` });
  }

  // อุปกรณ์ที่ถูกลบแล้ว (deleted_at ไม่เป็น NULL) ขอยืมไม่ได้
  const equipment = await pool.query(
    'SELECT id FROM equipment WHERE id = $1 AND deleted_at IS NULL',
    [equipmentId]
  );
  if (equipment.rows.length === 0) {
    return res.status(404).json({ error: 'ไม่พบอุปกรณ์' });
  }

  // กฎ: อุปกรณ์ที่มีคำขอ approved อยู่ (ถูกยืมอยู่) ห้ามขอยืม
  const borrowed = await pool.query(
    "SELECT 1 FROM loans WHERE equipment_id = $1 AND status = 'approved'",
    [equipmentId]
  );
  if (borrowed.rows.length > 0) {
    return res.status(409).json({ error: 'อุปกรณ์นี้ถูกยืมอยู่' });
  }

  // กันส่งคำขอซ้ำ: คนเดิมมีคำขอที่ยังรออนุมัติสำหรับอุปกรณ์นี้อยู่แล้ว
  const pending = await pool.query(
    "SELECT 1 FROM loans WHERE equipment_id = $1 AND user_id = $2 AND status = 'requested'",
    [equipmentId, req.user.id]
  );
  if (pending.rows.length > 0) {
    return res.status(409).json({ error: 'คุณมีคำขอยืมอุปกรณ์นี้ที่รออนุมัติอยู่แล้ว' });
  }

  const { rows } = await pool.query(
    `INSERT INTO loans (user_id, equipment_id, purpose) VALUES ($1, $2, $3) RETURNING id`,
    [req.user.id, equipmentId, purpose || null]
  );
  res.status(201).json({ loan: toPublicLoan(await findLoan(rows[0].id)) });
});

// เปลี่ยนสถานะจาก requested เป็น newStatus (ใช้ทั้งอนุมัติและปฏิเสธ)
async function decide(req, res, newStatus) {
  const id = parseId(req.params.id);
  const loan = await findLoan(id);
  if (!loan) return res.status(404).json({ error: 'ไม่พบคำขอ' });
  if (loan.status !== 'requested') {
    return res.status(409).json({ error: 'คำขอนี้ถูกดำเนินการไปแล้ว' });
  }

  try {
    // WHERE status = 'requested' กันกรณี admin สองคนกดพร้อมกัน
    const result = await pool.query(
      `UPDATE loans SET status = $1, decided_by = $2, decided_at = now()
       WHERE id = $3 AND status = 'requested'`,
      [newStatus, req.user.id, id]
    );
    if (result.rowCount === 0) {
      return res.status(409).json({ error: 'คำขอนี้ถูกดำเนินการไปแล้ว' });
    }
  } catch (err) {
    // 23505 = ชน unique index "อุปกรณ์หนึ่งชิ้นมี approved ได้รายการเดียว"
    if (err.code === '23505') {
      return res.status(409).json({ error: 'อุปกรณ์นี้ถูกยืมอยู่ ต้องรอให้คืนก่อนจึงอนุมัติได้' });
    }
    throw err;
  }
  res.json({ loan: toPublicLoan(await findLoan(id)) });
}

// POST /api/loans/:id/approve — admin อนุมัติ
router.post('/:id/approve', requireRole('admin'), (req, res) => decide(req, res, 'approved'));

// POST /api/loans/:id/reject — admin ปฏิเสธ
router.post('/:id/reject', requireRole('admin'), (req, res) => decide(req, res, 'rejected'));

// POST /api/loans/:id/return — เจ้าของคำขอคืนอุปกรณ์ ต้องแนบรูปช่อง "image" (multipart)
router.post('/:id/return', requireRole('member'), acceptImage, async (req, res) => {
  const id = parseId(req.params.id);
  const loan = await findLoan(id);
  if (!loan) return res.status(404).json({ error: 'ไม่พบคำขอ' });

  // กฎ: คืนได้เฉพาะเจ้าของคำขอ
  if (loan.user_id !== req.user.id) {
    return res.status(403).json({ error: 'คืนได้เฉพาะคำขอของตัวเอง' });
  }
  // กฎ: คืนได้เฉพาะคำขอที่ approved
  if (loan.status !== 'approved') {
    return res.status(409).json({ error: 'คืนได้เฉพาะคำขอที่อนุมัติแล้ว' });
  }
  // กฎ: ต้องมีรูปจึงคืนได้
  if (!req.file) {
    return res.status(400).json({ error: 'กรุณาแนบรูปถ่ายอุปกรณ์ตอนคืน' });
  }

  let imagePath;
  try {
    imagePath = saveImage(req.file);
  } catch (err) {
    if (err instanceof UploadError) return res.status(err.status).json({ error: err.message });
    throw err;
  }

  const result = await pool.query(
    `UPDATE loans SET status = 'returned', return_image_path = $1, returned_at = now()
     WHERE id = $2 AND status = 'approved'`,
    [imagePath, id]
  );
  if (result.rowCount === 0) {
    deleteImage(imagePath); // มีคนคืนไปก่อนแล้ว ไม่ต้องเก็บรูปนี้
    return res.status(409).json({ error: 'คืนได้เฉพาะคำขอที่อนุมัติแล้ว' });
  }
  res.json({ loan: toPublicLoan(await findLoan(id)) });
});

// GET /api/loans/:id/return-image — รูปที่แนบตอนคืน (admin หรือเจ้าของคำขอเท่านั้น)
router.get('/:id/return-image', async (req, res) => {
  const id = parseId(req.params.id);
  const loan = await findLoan(id);
  if (!loan || !loan.return_image_path) return res.status(404).json({ error: 'ไม่พบรูป' });

  if (req.user.role !== 'admin' && loan.user_id !== req.user.id) {
    return res.status(403).json({ error: 'คุณไม่มีสิทธิ์ดูรูปนี้' });
  }
  res.set('X-Content-Type-Options', 'nosniff');
  res.sendFile(imageFullPath(loan.return_image_path), (err) => {
    if (err && !res.headersSent) res.status(404).json({ error: 'ไม่พบไฟล์รูป' });
  });
});

module.exports = router;
