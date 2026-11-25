'use client';
// ฟอร์มเพิ่ม/แก้อุปกรณ์ (ใช้ร่วมกันทั้งหน้าเพิ่มและหน้าแก้)
//   item = null  -> โหมดเพิ่ม (POST /api/equipment)
//   item = {...} -> โหมดแก้   (PUT  /api/equipment/:id)
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { EquipmentImage } from './EquipmentCard';
import ImagePicker from './ImagePicker';
import { ErrorBox, FormRow, SectionTitle } from './FormParts';
import { BoxIcon, CheckIcon } from './Icons';

export default function EquipmentForm({ item }) {
  const router = useRouter();
  const [name, setName] = useState(item?.name || '');
  const [category, setCategory] = useState(item?.category || '');
  const [description, setDescription] = useState(item?.description || '');
  const [file, setFile] = useState(null); // รูปใหม่ที่เลือก (ยังไม่ได้ส่ง)
  const [filePreview, setFilePreview] = useState(null);
  const [categories, setCategories] = useState([]);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  // ดึงหมวดที่มีอยู่แล้วมาเป็นตัวเลือกแนะนำในช่องหมวด
  useEffect(() => {
    api('/equipment')
      .then((res) => {
        if (res.ok) setCategories([...new Set(res.data.equipment.map((e) => e.category))]);
      })
      .catch(() => {}); // โหลดหมวดไม่ได้ก็ยังพิมพ์เองได้
  }, []);

  // คืนหน่วยความจำของรูปพรีวิวเมื่อเปลี่ยนรูปหรือออกจากหน้า
  useEffect(() => {
    return () => filePreview && URL.revokeObjectURL(filePreview);
  }, [filePreview]);

  function pickFile(chosen) {
    setFile(chosen);
    setFilePreview(URL.createObjectURL(chosen));
  }

  // เอารูปที่เพิ่งเลือกออก (กลับไปใช้รูปเดิม ถ้ามี)
  function removeFile() {
    setFile(null);
    setFilePreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSaving(true);

    const form = new FormData();
    form.append('name', name);
    form.append('category', category);
    form.append('description', description);
    if (file) form.append('image', file);

    let res;
    try {
      res = item
        ? await api(`/equipment/${item.id}`, { method: 'PUT', body: form })
        : await api('/equipment', { method: 'POST', body: form });
    } catch {
      res = { ok: false, data: { error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่' } };
    }
    setSaving(false);

    if (!res.ok) {
      setError(res.data?.error || 'บันทึกไม่สำเร็จ');
      return;
    }
    router.push('/admin/equipment');
  }

  return (
    <form onSubmit={handleSubmit} className="card grid gap-8 p-5 sm:p-8 lg:grid-cols-[280px_1fr]">
      {/* ซ้าย: รูปอุปกรณ์ */}
      <div className="flex flex-col gap-3">
        <span className="label">รูปอุปกรณ์</span>
        <ImagePicker
          id="equipment-image"
          hasFile={Boolean(file || item?.imageUrl)}
          previewSrc={filePreview}
          previewAlt="ตัวอย่างรูปใหม่"
          onPick={pickFile}
          onError={setError}
          onRemove={removeFile}
        />
        {/* ยังไม่ได้เลือกรูปใหม่: แสดงรูปเดิม หรือภาพแทน */}
        {!filePreview && (
          <EquipmentImage src={item?.imageUrl} alt={item?.name || 'อุปกรณ์ใหม่'} className="aspect-[4/3] w-full rounded-2xl" />
        )}
      </div>

      {/* ขวา: ข้อมูลอุปกรณ์ */}
      <div className="flex flex-col gap-5">
        <SectionTitle icon={<BoxIcon />}>ข้อมูลอุปกรณ์</SectionTitle>

        <FormRow label="ชื่ออุปกรณ์" required htmlFor="eq-name">
          <input id="eq-name" className="input" value={name} onChange={(e) => setName(e.target.value)} required maxLength={100} />
        </FormRow>

        <FormRow label="หมวด" required htmlFor="eq-category">
          <input
            id="eq-category"
            className="input"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            required
            maxLength={50}
            list="category-options"
            placeholder="เลือกหมวดที่มี หรือพิมพ์หมวดใหม่"
          />
          <datalist id="category-options">
            {categories.map((c) => (
              <option key={c} value={c} />
            ))}
          </datalist>
        </FormRow>

        <FormRow label="รายละเอียดเพิ่มเติม" htmlFor="eq-description">
          <textarea
            id="eq-description"
            className="input min-h-28"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            maxLength={1000}
          />
        </FormRow>

        <ErrorBox message={error} />

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href="/admin/equipment" className="btn-outline sm:w-40">ยกเลิก</Link>
          <button type="submit" disabled={saving} className="btn-primary sm:w-44">
            <CheckIcon /> {saving ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
          </button>
        </div>
      </div>
    </form>
  );
}
