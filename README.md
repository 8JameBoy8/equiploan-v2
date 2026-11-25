# equiploan — ระบบยืม-คืนอุปกรณ์ของชมรม

| ส่วน | โฟลเดอร์ | พอร์ต |
|---|---|---|
| Frontend (Next.js + Tailwind) | `frontend/` | 3000 |
| Backend (Node.js + Express) | `backend/` | 4000 |
| Database (PostgreSQL) | `db/schema.sql` | 5432 |

ต้องใช้ Node.js 24 (ดู `.nvmrc`) และ PostgreSQL 17 ที่ติดตั้งบน Windows

## ติดตั้งครั้งแรก

### 1. ติดตั้ง PostgreSQL
1. ดาวน์โหลดตัวติดตั้ง PostgreSQL 17 สำหรับ Windows จาก https://www.postgresql.org/download/windows/
   (ใช้ installer ของ EDB) หรือใช้คำสั่ง `winget install PostgreSQL.PostgreSQL.17`
2. ตอนติดตั้ง ตั้งรหัสผ่านของผู้ใช้ `postgres` และใช้พอร์ต 5432
3. เปิดโปรแกรม **SQL Shell (psql)** จากเมนู Start แล้วกด Enter ตามค่าเริ่มต้นจนถึงรหัสผ่าน
   แล้วสร้างผู้ใช้และฐานข้อมูลของโปรเจกต์ (เปลี่ยน `รหัสผ่านของคุณ` เป็นรหัสที่ตั้งเอง):
   ```sql
   CREATE USER equiploan WITH PASSWORD 'รหัสผ่านของคุณ';
   CREATE DATABASE equiploan OWNER equiploan;
   ```

### 2. Backend
```bash
cd backend
copy .env.example .env
```
แก้ `backend/.env`:
- `DATABASE_URL` เปลี่ยน `CHANGE_ME` เป็นรหัสผ่านของผู้ใช้ `equiploan`
- `JWT_SECRET` ใส่ข้อความสุ่มยาวๆ (สร้างได้ด้วย `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` บัญชี admin ที่ระบบจะสร้างให้ตอนเริ่มทำงาน

```bash
npm ci
npm run db:init
npm run db:seed
npm run dev
```
- `db:init` สร้าง/อัปเดตตาราง (รันซ้ำได้ ข้อมูลเดิมไม่หาย) — ทุกครั้งที่ดึงโค้ดเฟสใหม่ให้รันอีกรอบ
- `db:seed` ใส่อุปกรณ์สมมติ 10 ชิ้น (ใส่เฉพาะตอนตารางอุปกรณ์ยังว่าง)
- รูปที่อัปโหลดเก็บใน `backend/uploads/` (เปลี่ยนได้ด้วย `UPLOAD_DIR`) ไม่ถูก commit

### 3. Frontend (เปิดอีกหน้าต่าง terminal)
```bash
cd frontend
copy .env.example .env
npm ci
npm run dev
```
เปิดเว็บที่ http://localhost:3000

## วิธีทดสอบเฟส 1

### ก. ตรวจ backend
| ทดสอบ | วิธี | ผลที่ควรได้ |
|---|---|---|
| health | เปิด http://localhost:4000/healthz | `{"status":"ok"}` |
| ready | เปิด http://localhost:4000/readyz | `{"status":"ready"}` (ถ้าปิด PostgreSQL จะได้ 503) |
| rewrites | เปิด http://localhost:3000/api/auth/me | `{"error":"กรุณาเข้าสู่ระบบ"}` แปลว่า FE ส่งต่อไป BE ได้ |

### ข. ทดสอบในเบราว์เซอร์
1. **สมัคร:** ไปที่ http://localhost:3000/register กรอกชื่อ อีเมล และรหัสผ่าน (อย่างน้อย 8 ตัว)
   → ต้องเข้าหน้าหลักของสมาชิกทันที มี **แถบเมนูด้านบน**
2. **สมัครซ้ำ:** ออกจากระบบ แล้วสมัครด้วยอีเมลเดิม → ต้องขึ้น "อีเมลนี้ถูกใช้สมัครแล้ว"
3. **ล็อกเอาท์:** กด "ออกจากระบบ" → กลับไปหน้าล็อกอิน แล้วลองเปิด http://localhost:3000/ → ต้องถูกพาไปหน้าล็อกอิน
4. **ล็อกอินผิด:** ใส่รหัสผ่านผิด → ต้องขึ้น "อีเมลหรือรหัสผ่านไม่ถูกต้อง"
5. **ล็อกอิน member:** ล็อกอินด้วยบัญชีที่สมัครไว้ → เข้าหน้าหลักของสมาชิก
6. **member เข้าหน้า admin ไม่ได้ (FE):** ขณะล็อกอินเป็น member เปิด http://localhost:3000/admin
   → ต้องขึ้นหน้า "ไม่มีสิทธิ์เข้าถึง"
7. **member เข้าหน้า admin ไม่ได้ (BE):** ขณะล็อกอินเป็น member เปิด http://localhost:3000/api/admin/ping
   → ต้องได้ `{"error":"คุณไม่มีสิทธิ์เข้าถึงส่วนนี้"}` (สถานะ 403)
   ข้อนี้สำคัญที่สุด เพราะแสดงว่าต่อให้ข้ามหน้าเว็บไปเรียก API ตรงๆ ก็ยังไม่ได้
8. **ล็อกอิน admin:** ออกจากระบบ แล้วล็อกอินด้วย `ADMIN_EMAIL` / `ADMIN_PASSWORD` จาก `backend/.env`
   → ต้องเข้าหน้า `/admin` มี **เมนูด้านข้าง** และขึ้นข้อความ "backend ยืนยันสิทธิ์ admin แล้ว"
9. **cookie เป็น httpOnly:** กด F12 → Application → Cookies → `localhost` จะเห็น `token` ที่ติ๊ก HttpOnly

### ค. ทดสอบด้วย curl (ไม่บังคับ ใช้ Git Bash)
```bash
curl -i -c c.txt -X POST localhost:4000/api/auth/register -H "Content-Type: application/json" -d '{"fullName":"ทดสอบ","email":"m1@test.local","password":"password123"}'
curl -i -b c.txt localhost:4000/api/auth/me
curl -i -b c.txt localhost:4000/api/admin/ping
curl -i -b c.txt -c c.txt -X POST localhost:4000/api/auth/logout
curl -i -b c.txt localhost:4000/api/auth/me
```
ผลที่ควรได้ตามลำดับ: 201, 200, **403**, 200, **401**

## วิธีทดสอบเฟส 2 (อุปกรณ์และรูป)

เตรียมไฟล์ทดสอบ 3 ไฟล์ไว้ในเครื่อง:
- รูป `.jpg` หรือ `.png` ขนาดเล็ก (ถ่ายจากมือถือหรือแคปหน้าจอก็ได้)
- ไฟล์ผิดชนิด เช่น `.gif` หรือ `.pdf`
- รูปที่ใหญ่เกิน 5MB (ถ้าไม่มี ใช้ไฟล์ปลอมที่สร้างด้วยคำสั่งด้านล่าง)

### ก. ทดสอบในเบราว์เซอร์
1. **member ดูอุปกรณ์:** ล็อกอินเป็น member → เมนู "อุปกรณ์" → เห็นการ์ด 10 ใบ แต่ละใบมีภาพแทน (กล่องฟ้าอ่อน),
   ชื่อ, หมวด และป้ายสีเขียว "ว่าง" และ**ไม่มีปุ่มแก้ไข**
2. **member เข้าหน้า admin ไม่ได้:** เปิด http://localhost:3000/admin/equipment/new → ขึ้น "ไม่มีสิทธิ์เข้าถึง"
3. **admin เพิ่มอุปกรณ์:** ล็อกอินเป็น admin → "จัดการอุปกรณ์" → "+ เพิ่มอุปกรณ์"
   → กรอกชื่อ, หมวด (มีหมวดเดิมให้เลือก), แนบรูป jpg/png → เห็นพรีวิว → "บันทึกข้อมูล"
   → กลับมาหน้ารายการ เห็นการ์ดใหม่พร้อมรูป
4. **ไฟล์ผิดชนิด:** ในฟอร์มเลือกไฟล์ `.gif`/`.pdf` → ขึ้น "รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP"
   (ถ้าหน้าต่างเลือกไฟล์ซ่อนไฟล์อื่นไว้ ให้เปลี่ยนตัวกรองเป็น "All files")
5. **ไฟล์ใหญ่เกิน:** เลือกรูปที่ใหญ่กว่า 5MB → ขึ้น "ไฟล์ใหญ่เกิน 5MB"
6. **admin แก้อุปกรณ์:** กด "แก้ไข" บนการ์ด → ข้อมูลเดิมและรูปเดิมขึ้นมา → แก้ชื่อและเปลี่ยนรูป → บันทึก
   → การ์ดแสดงชื่อใหม่และรูปใหม่ และในโฟลเดอร์ `backend/uploads/` ไฟล์รูปเก่าถูกลบไป เหลือแต่ไฟล์ใหม่
7. **ชื่อไฟล์ถูกตั้งใหม่:** ดูในโฟลเดอร์ `backend/uploads/` ชื่อไฟล์เป็นรหัสสุ่ม เช่น `3f9c...e1.jpg` ไม่ใช่ชื่อเดิม

### ข. ทดสอบ backend โดยตรงด้วย curl (Git Bash)
ข้อ 4–5 ข้างบนเป็นการตรวจฝั่ง FE เท่านั้น ข้อนี้พิสูจน์ว่า **BE ปฏิเสธเองด้วย** แม้จะข้าม FE มา
```bash
# ล็อกอินเป็น admin (แก้อีเมล/รหัสให้ตรงกับ backend/.env)
curl -s -c a.txt -X POST localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"admin@example.com","password":"รหัสadmin"}'

# สร้างไฟล์ทดสอบ: ไฟล์ข้อความที่ตั้งชื่อเป็น .jpg และไฟล์ 6MB
echo "not an image" > fake.jpg
node -e "const b=Buffer.alloc(6*1024*1024);b[0]=0xff;b[1]=0xd8;b[2]=0xff;require('fs').writeFileSync('big.jpg',b)"

# 1) ไฟล์ปลอม (นามสกุล .jpg แต่เนื้อไม่ใช่รูป) -> 400
curl -s -w " [%{http_code}]\n" -b a.txt -F name=X -F category=Y -F "image=@fake.jpg;type=image/jpeg" localhost:4000/api/equipment
# 2) ไฟล์ .gif -> 400
curl -s -w " [%{http_code}]\n" -b a.txt -F name=X -F category=Y -F "image=@รูป.gif;type=image/gif" localhost:4000/api/equipment
# 3) ไฟล์ 6MB -> 413
curl -s -w " [%{http_code}]\n" -b a.txt -F name=X -F category=Y -F "image=@big.jpg;type=image/jpeg" localhost:4000/api/equipment
# 4) ดูรูปโดยไม่ล็อกอิน -> 401
curl -s -w " [%{http_code}]\n" localhost:4000/api/equipment/1/image
```
ล็อกอินเป็น member (cookie ไฟล์ `m.txt`) แล้วลองเพิ่มอุปกรณ์ → ต้องได้ **403**
```bash
curl -s -c m.txt -X POST localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"อีเมลmember","password":"รหัสmember"}'
curl -s -w " [%{http_code}]\n" -b m.txt -F name=X -F category=Y localhost:4000/api/equipment
```

## วิธีทดสอบเฟส 3 (ยืม-คืน)

ต้องมีบัญชี member **2 คน** (สมัครเพิ่มที่ `/register`) และบัญชี admin  
แนะนำให้เปิด admin ในหน้าต่าง Incognito จะได้ไม่ต้องล็อกเอาท์สลับไปมา

### ก. เดิน workflow ครบในเบราว์เซอร์
1. **member A ขอยืมจากการ์ด:** เมนู "อุปกรณ์" → กด "ขอยืม" บนการ์ดใดก็ได้
   → ฟอร์มเลือกอุปกรณ์นั้นไว้ให้แล้ว และแสดง**รูปและชื่อ**อุปกรณ์ทันที
2. **เปลี่ยนอุปกรณ์:** เลือกชิ้นอื่นใน dropdown → รูปและชื่อด้านซ้ายเปลี่ยนตามทันที
   (อุปกรณ์ที่ไม่มีรูปจะแสดงกล่องฟ้าอ่อนแทน) — dropdown มีเฉพาะอุปกรณ์ที่ว่าง
3. **ส่งคำขอ:** พิมพ์วัตถุประสงค์ (หรือเว้นว่างก็ได้) → "ส่งคำขอยืม" → ไปหน้า "คำขอของฉัน" สถานะ **รออนุมัติ**
4. **admin อนุมัติ:** "จัดการคำขอ" → แท็บ "รออนุมัติ" เห็นตัวเลขจำนวน, ชื่อผู้ยืม และ**วัตถุประสงค์**
   → กด "อนุมัติ" → ขึ้นข้อความสีเขียว
5. **อุปกรณ์กลายเป็นถูกยืม:** member A ดูหน้า "อุปกรณ์" → การ์ดนั้นป้ายส้ม "ถูกยืม" และปุ่มเป็นสีเทา "ถูกยืมอยู่"
6. **คืน:** member A → "คำขอของฉัน" → "คืนอุปกรณ์" → ปุ่มเขียนว่า "เลือกรูปก่อนจึงจะยืนยันได้" และกดไม่ได้
   → เลือกรูป → เห็นพรีวิว ปุ่มเปลี่ยนเป็น "ยืนยันการคืน" → กด → สถานะ **คืนแล้ว**
7. **admin ดูรูปคืน:** "จัดการคำขอ" → แท็บ "ทั้งหมด" → "ดูรูปคืน" → รูปขึ้นในหน้าต่างซ้อน (กด Esc หรือ "ปิด")
8. **admin ปฏิเสธ:** member ส่งคำขออีกรายการ → admin กด "ปฏิเสธ" → member เห็นสถานะ **ปฏิเสธ** และไม่มีปุ่มคืน

### ข. กรณีผิดกฎ (ในเบราว์เซอร์)
| ทดสอบ | วิธี | ผลที่ควรได้ |
|---|---|---|
| ขอยืมซ้ำ (ยังรออนุมัติ) | ส่งคำขออุปกรณ์ชิ้นเดิมอีกครั้ง | "คุณมีคำขอยืมอุปกรณ์นี้ที่รออนุมัติอยู่แล้ว" |
| ขอยืมของที่ถูกยืมอยู่ | เปิด `/borrow?equipmentId=<id ของชิ้นที่ถูกยืม>` | "อุปกรณ์ที่เลือกมาไม่ว่างแล้ว" และไม่มีในรายการ |
| อนุมัติซ้ำอุปกรณ์เดียวกัน | member A และ B ขอชิ้นเดียวกัน → admin อนุมัติ A แล้วอนุมัติ B | ข้อความแดง "อุปกรณ์นี้ถูกยืมอยู่ ต้องรอให้คืนก่อนจึงอนุมัติได้" |
| วัตถุประสงค์ยาวเกิน | วางข้อความยาวกว่า 500 ตัว | ตัวนับเป็นสีแดง `501/500` และปุ่มส่งกดไม่ได้ |
| คืนไม่มีรูป | หน้าคืน ไม่เลือกรูป | ปุ่มยืนยันกดไม่ได้ |
| รูปคืนผิดชนิด | เลือกไฟล์ `.pdf`/`.gif` | "รองรับเฉพาะไฟล์ JPG, PNG หรือ WEBP" |

### ค. กรณีผิดกฎที่ BE ต้องปฏิเสธเอง (curl ใน Git Bash)
หน้าเว็บกันไว้แล้ว แต่ข้อเหล่านี้พิสูจน์ว่า**ต่อให้ข้ามหน้าเว็บ** BE ก็ไม่ยอม  
เตรียม cookie: `a.txt` (admin), `m.txt` (member A), `m2.txt` (member B) แบบเดียวกับเฟส 2 แล้วแทน `<ID>` ด้วยเลขคำขอ
```bash
# วัตถุประสงค์ 501 ตัวอักษร -> 400
node -e "require('fs').writeFileSync('p501.json',JSON.stringify({equipmentId:1,purpose:'ก'.repeat(501)}))"
curl -s -w " [%{http_code}]\n" -b m.txt -X POST localhost:4000/api/loans -H "Content-Type: application/json" -d @p501.json

# ขอยืมอุปกรณ์ที่ถูกยืมอยู่ -> 409   (แทน 1 ด้วย id อุปกรณ์ที่ถูกยืม)
curl -s -w " [%{http_code}]\n" -b m2.txt -X POST localhost:4000/api/loans -H "Content-Type: application/json" -d '{"equipmentId":1}'

# คืนโดยไม่มีรูป -> 400
curl -s -w " [%{http_code}]\n" -b m.txt -X POST localhost:4000/api/loans/<ID>/return

# คืนคำขอของคนอื่น (member B คืนของ A) -> 403
curl -s -w " [%{http_code}]\n" -b m2.txt -X POST -F "image=@รูป.jpg" localhost:4000/api/loans/<ID>/return

# คืนคำขอที่ยังรออนุมัติ/ถูกปฏิเสธ -> 409
curl -s -w " [%{http_code}]\n" -b m.txt -X POST -F "image=@รูป.jpg" localhost:4000/api/loans/<ID ที่ยังไม่อนุมัติ>/return

# member อนุมัติเอง -> 403
curl -s -w " [%{http_code}]\n" -b m.txt -X POST localhost:4000/api/loans/<ID>/approve

# member B ดูรูปคืนของ A -> 403
curl -s -w " [%{http_code}]\n" -b m2.txt localhost:4000/api/loans/<ID>/return-image
```

## วิธีทดสอบฟีเจอร์ลบอุปกรณ์ (admin)

ลบแบบ soft delete: ไม่ลบแถวออกจากฐานข้อมูลจริง แต่ใส่เวลาลงคอลัมน์ `equipment.deleted_at`
อุปกรณ์ที่ลบแล้วจะไม่แสดงในรายการ แก้ไขและขอยืมไม่ได้ แต่ประวัติคำขอยืมเก่ายังแสดงชื่อและรูปครบ

ถ้าฐานข้อมูลสร้างไว้ก่อนมีฟีเจอร์นี้ ให้รัน `npm run db:init` ในโฟลเดอร์ backend อีกครั้ง (เพิ่มคอลัมน์ให้ ข้อมูลเดิมไม่หาย)

1. ล็อกอิน admin → จัดการอุปกรณ์ → เพิ่มอุปกรณ์ทดสอบ แล้วกด "ลบ" บนการ์ด → หน้าต่างยืนยัน → "ลบอุปกรณ์"
   → การ์ดหายไปและมีข้อความ "ลบ ... แล้ว"
2. ให้ member ส่งคำขอยืมอุปกรณ์ชิ้นหนึ่ง แล้ว admin กดลบชิ้นนั้น → หน้าต่างขึ้นข้อความว่าลบไม่ได้
   (เช่นเดียวกับอุปกรณ์ที่ถูกยืมอยู่) ปฏิเสธคำขอหรือรอให้คืนก่อนจึงลบได้
3. ลบอุปกรณ์ที่เคยมีคำขอที่คืนแล้ว → ล็อกอิน member → "คำขอของฉัน" ยังเห็นคำขอนั้นพร้อมชื่ออุปกรณ์
4. member เรียก `DELETE /api/equipment/:id` เอง → 403 (BE ตรวจสิทธิ์ ไม่ใช่แค่ซ่อนปุ่ม)
