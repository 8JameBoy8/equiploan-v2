// ตัวช่วยเรียก backend ผ่าน /api (Next.js rewrites ส่งต่อให้)
// คืนค่า { ok, status, data } เพื่อให้หน้าเว็บตัดสินใจเองว่าจะแสดงอะไร
//   body เป็น object ธรรมดา -> ส่งเป็น JSON
//   body เป็น FormData (มีไฟล์แนบ) -> ส่งเป็น multipart ให้เบราว์เซอร์ตั้ง header เอง
export async function api(path, { method = 'GET', body } = {}) {
  const isForm = body instanceof FormData;
  const res = await fetch(`/api${path}`, {
    method,
    headers: body && !isForm ? { 'Content-Type': 'application/json' } : undefined,
    body: body ? (isForm ? body : JSON.stringify(body)) : undefined,
    credentials: 'same-origin', // ส่ง cookie ไปด้วย
  });
  let data = null;
  try {
    data = await res.json();
  } catch {
    // บาง response ไม่มี body ที่เป็น JSON
  }
  return { ok: res.ok, status: res.status, data };
}
