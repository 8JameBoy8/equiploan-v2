// หน้า 404: เปิดลิงก์ที่ไม่มีอยู่
import Link from 'next/link';
import ClubLogo from '@/components/ClubLogo';

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-4">
      <ClubLogo />
      <div className="card w-full max-w-md p-8 text-center">
        <p className="text-6xl font-bold text-blue-200">404</p>
        <h1 className="mt-2 text-xl font-bold text-slate-800">ไม่พบหน้าที่ต้องการ</h1>
        <p className="mt-1 text-slate-500">ลิงก์อาจไม่ถูกต้อง หรือหน้านี้ถูกย้ายไปแล้ว</p>
        <Link href="/" className="btn-primary mt-6">กลับหน้าหลัก</Link>
      </div>
    </main>
  );
}
