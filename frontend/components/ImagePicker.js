'use client';
// กล่องเลือกรูป (เส้นประ + ไอคอนกล้อง) พร้อมพรีวิวและปุ่ม ✕ เอารูปที่เลือกออก
// ใช้ร่วมกันในฟอร์มอุปกรณ์และฟอร์มคืน
//   previewSrc: รูปที่จะแสดง (รูปที่เลือกใหม่ หรือรูปเดิม)
//   onPick(file): เรียกเมื่อเลือกไฟล์ที่ผ่านการตรวจแล้ว
//   onError(message): เรียกเมื่อไฟล์ใช้ไม่ได้
//   onRemove(): ถ้าส่งมา จะมีปุ่ม ✕ บนรูปพรีวิว
import { IMAGE_ACCEPT, checkImageFile } from '@/lib/imageFile';
import { CameraIcon, XIcon } from './Icons';

export default function ImagePicker({ id, previewSrc, previewAlt, onPick, onError, onRemove, hasFile }) {
  function handleChange(e) {
    const chosen = e.target.files[0];
    e.target.value = ''; // ให้เลือกไฟล์เดิมซ้ำได้
    if (!chosen) return;
    const fileError = checkImageFile(chosen); // ตรวจเบื้องต้น (BE ตรวจซ้ำเสมอ)
    if (fileError) {
      onError(fileError);
      return;
    }
    onError('');
    onPick(chosen);
  }

  return (
    <div className="flex flex-col gap-3">
      <label
        htmlFor={id}
        className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-2xl border-2 border-dashed border-blue-300 bg-blue-50/50 px-4 py-6 text-center transition hover:border-blue-500 hover:bg-blue-50"
      >
        <CameraIcon className="h-8 w-8 text-blue-600" />
        <span className="font-semibold text-blue-700">{hasFile ? 'เปลี่ยนรูป' : 'คลิกเพื่ออัปโหลดรูปภาพ'}</span>
        <span className="text-xs text-slate-500">รองรับไฟล์ JPG, PNG, WEBP ไม่เกิน 5MB</span>
        <input id={id} type="file" accept={IMAGE_ACCEPT} onChange={handleChange} className="sr-only" />
      </label>

      {previewSrc && (
        <div className="relative w-fit max-w-full">
          <img src={previewSrc} alt={previewAlt} className="max-h-60 max-w-full rounded-2xl object-contain ring-1 ring-blue-100" />
          {onRemove && (
            <button
              type="button"
              onClick={onRemove}
              aria-label="เอารูปที่เลือกออก"
              className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-700 shadow hover:bg-red-50 hover:text-red-600"
            >
              <XIcon className="h-4 w-4" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
