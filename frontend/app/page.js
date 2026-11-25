'use client';
// หน้าหลักของสมาชิก (member) หลังล็อกอิน: คำทักทาย + ทางลัดไปหน้าที่ใช้บ่อย
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { BoxIcon, ChevronRightIcon, HomeIcon, ListIcon, SendIcon } from '@/components/Icons';

const SHORTCUTS = [
  { href: '/equipment', icon: BoxIcon, title: 'ดูอุปกรณ์', text: 'ดูอุปกรณ์ทั้งหมดและสถานะว่าง/ถูกยืม' },
  { href: '/borrow', icon: SendIcon, title: 'ขอยืมอุปกรณ์', text: 'เลือกอุปกรณ์ที่ว่างแล้วส่งคำขอยืม' },
  { href: '/my-loans', icon: ListIcon, title: 'คำขอของฉัน', text: 'ติดตามสถานะ และคืนอุปกรณ์พร้อมรูปถ่าย' },
];

export default function MemberHomePage() {
  return (
    <AppShell role="member">
      {(user) => (
        <>
          <PageHeader
            icon={<HomeIcon className="h-7 w-7" />}
            title={`สวัสดี ${user.fullName}`}
            subtitle="ยินดีต้อนรับสู่ระบบยืม-คืนอุปกรณ์ของชมรม"
          />
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {SHORTCUTS.map(({ href, icon: Icon, title, text }) => (
              <Link key={href} href={href} className="card group flex items-center gap-4 p-5 transition hover:-translate-y-0.5">
                <span className="rounded-2xl bg-blue-50 p-3 text-blue-700 ring-1 ring-inset ring-blue-100">
                  <Icon className="h-7 w-7" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-slate-800">{title}</p>
                  <p className="text-sm text-slate-500">{text}</p>
                </div>
                <ChevronRightIcon className="h-5 w-5 shrink-0 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
              </Link>
            ))}
          </div>
        </>
      )}
    </AppShell>
  );
}
