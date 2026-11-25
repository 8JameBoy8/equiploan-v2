'use client';
// หน้ารายการอุปกรณ์ของสมาชิก (member) — การ์ดที่ว่างมีปุ่ม "ขอยืม"
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import EquipmentGrid from '@/components/EquipmentGrid';
import PageHeader from '@/components/PageHeader';
import { BoxIcon, SendIcon } from '@/components/Icons';

// ปุ่มท้ายการ์ด: ว่าง -> ไปฟอร์มขอยืมโดยเลือกอุปกรณ์นี้ไว้ให้, ถูกยืม -> ปุ่มสีเทากดไม่ได้
function BorrowAction({ item }) {
  if (item.status !== 'available') {
    return (
      <span className="block cursor-not-allowed rounded-xl bg-slate-100 py-2.5 text-center font-semibold text-slate-400">
        ถูกยืมอยู่
      </span>
    );
  }
  return (
    <Link
      href={`/borrow?equipmentId=${item.id}`}
      className="btn-primary w-full"
    >
      <SendIcon className="h-4 w-4" /> ขอยืม
    </Link>
  );
}

export default function EquipmentPage() {
  return (
    <AppShell role="member">
      {() => (
        <>
          <PageHeader
            icon={<BoxIcon className="h-7 w-7" />}
            title="อุปกรณ์ของชมรม"
            subtitle="ดูอุปกรณ์ทั้งหมดและสถานะว่าง/ถูกยืม"
          />
          <EquipmentGrid renderAction={(item) => <BorrowAction item={item} />} />
        </>
      )}
    </AppShell>
  );
}
