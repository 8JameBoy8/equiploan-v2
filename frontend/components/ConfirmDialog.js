'use client';
// หน้าต่างถามยืนยันก่อนทำสิ่งที่ย้อนกลับไม่ได้ (เช่น ลบอุปกรณ์)
//   onConfirm: กดปุ่มยืนยัน, onCancel: กดยกเลิก / พื้นหลัง / Esc
//   busy: กำลังทำงานอยู่ ปิดปุ่มไว้กันกดซ้ำ, error: ข้อความผิดพลาด (ถ้ามี)
import { useEffect } from 'react';
import { AlertIcon } from './Icons';

export default function ConfirmDialog({ title, message, confirmLabel, busy, error, onConfirm, onCancel }) {
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !busy && onCancel();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [busy, onCancel]);

  return (
    <div
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
      onClick={() => !busy && onCancel()}
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4"
    >
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-md rounded-3xl bg-white p-6 text-center shadow-xl">
        <div className="mx-auto mb-4 w-fit rounded-full bg-red-50 p-4 text-red-500">
          <AlertIcon className="h-8 w-8" />
        </div>
        <h2 id="confirm-title" className="text-lg font-bold text-slate-800">{title}</h2>
        <p className="mt-2 text-sm text-slate-500">{message}</p>

        {error && (
          <p role="alert" className="mt-4 rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
            {error}
          </p>
        )}

        <div className="mt-6 grid grid-cols-2 gap-3">
          <button onClick={onCancel} disabled={busy} className="btn-outline">ยกเลิก</button>
          {/* ปุ่มยืนยันเป็นสีแดงทึบ เพื่อให้เห็นชัดว่าเป็นการลบ */}
          <button
            onClick={onConfirm}
            disabled={busy}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {busy ? 'กำลังลบ...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
