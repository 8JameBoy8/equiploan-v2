-- โครงสร้างฐานข้อมูลของระบบยืม-คืนอุปกรณ์ (equiploan)
-- รันซ้ำได้อย่างปลอดภัย เพราะใช้ IF NOT EXISTS ทุกคำสั่ง

-- ผู้ใช้: สมาชิก (member) และผู้ดูแล (admin)
CREATE TABLE IF NOT EXISTS users (
  id            SERIAL PRIMARY KEY,
  email         VARCHAR(255) NOT NULL UNIQUE,          -- เก็บเป็นตัวพิมพ์เล็กเสมอ
  password_hash TEXT NOT NULL,                          -- เก็บเฉพาะ hash (bcrypt) ห้ามเก็บรหัสผ่านจริง
  full_name     VARCHAR(100) NOT NULL,
  role          VARCHAR(10) NOT NULL DEFAULT 'member'
                CHECK (role IN ('member', 'admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- อุปกรณ์: หนึ่งแถวคือหนึ่งชิ้น
CREATE TABLE IF NOT EXISTS equipment (
  id          SERIAL PRIMARY KEY,
  name        VARCHAR(100) NOT NULL,
  description TEXT,
  image_path  VARCHAR(255),                             -- ชื่อไฟล์รูปในโฟลเดอร์อัปโหลด (ไม่มีก็ได้)
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- เฟส 2: เพิ่มหมวดของอุปกรณ์ (ใช้ ALTER เพื่อให้ฐานข้อมูลเดิมที่สร้างไว้แล้วได้คอลัมน์นี้ด้วย)
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS category VARCHAR(50) NOT NULL DEFAULT 'ทั่วไป';

-- เพิ่ม: ลบอุปกรณ์แบบ soft delete (ไม่ลบแถวจริง เพื่อให้ประวัติคำขอยืมเก่ายังอ้างถึงได้)
--   NULL = ยังใช้งานอยู่, มีค่า = ถูกลบแล้ว (เวลาที่ลบ)
ALTER TABLE equipment ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- คำขอยืม: requested -> approved หรือ rejected -> returned
CREATE TABLE IF NOT EXISTS loans (
  id                SERIAL PRIMARY KEY,
  user_id           INT NOT NULL REFERENCES users(id),
  equipment_id      INT NOT NULL REFERENCES equipment(id),
  purpose           VARCHAR(500),                       -- วัตถุประสงค์การยืม (ไม่บังคับ, ไม่เกิน 500 ตัวอักษร)
  status            VARCHAR(10) NOT NULL DEFAULT 'requested'
                    CHECK (status IN ('requested', 'approved', 'rejected', 'returned')),
  return_image_path VARCHAR(255),                       -- รูปที่แนบตอนคืน
  decided_by        INT REFERENCES users(id),           -- admin ที่อนุมัติ/ปฏิเสธ
  requested_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  decided_at        TIMESTAMPTZ,
  returned_at       TIMESTAMPTZ
);

-- กฎ: อุปกรณ์หนึ่งชิ้นมีคำขอที่ approved ได้ไม่เกิน 1 รายการในเวลาเดียวกัน
CREATE UNIQUE INDEX IF NOT EXISTS loans_one_approved_per_equipment
  ON loans (equipment_id) WHERE status = 'approved';
