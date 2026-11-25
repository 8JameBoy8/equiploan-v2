'use client';
// หน้าต่างซ้อนแสดงรูปขนาดใหญ่ กดพื้นหลัง ปุ่มปิด หรือปุ่ม Esc เพื่อปิด
import { useEffect } from 'react';

export default function ImageModal({ src, title, onClose }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-3xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="font-semibold text-slate-800">{title}</h2>
          <button onClick={onClose} className="rounded-xl px-3 py-1 text-slate-500 hover:bg-slate-100">
            ปิด
          </button>
        </div>
        <img src={src} alt={title} className="max-h-[70vh] w-full rounded-2xl object-contain" />
      </div>
    </div>
  );
}
