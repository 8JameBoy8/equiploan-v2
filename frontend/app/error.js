'use client';
// หน้าแสดงเมื่อเกิดข้อผิดพลาดที่ไม่คาดคิดในหน้าใดก็ได้ (Next.js เรียกให้อัตโนมัติ)
//   reset(): ลองแสดงหน้าเดิมใหม่อีกครั้ง
import Link from 'next/link';
import { ErrorState } from '@/components/States';

export default function GlobalError({ reset }) {
  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
      <div className="w-full">
        <ErrorState
          title="เกิดข้อผิดพลาด"
          message="ระบบแสดงหน้านี้ไม่ได้ กรุณาลองใหม่อีกครั้ง"
          onRetry={reset}
          action={<Link href="/" className="btn-outline">กลับหน้าหลัก</Link>}
        />
      </div>
    </main>
  );
}
