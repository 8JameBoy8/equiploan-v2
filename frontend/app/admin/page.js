'use client';
// หน้าหลักของผู้ดูแล (admin): แสดงเฉพาะจำนวนคำขอที่รออนุมัติ
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { ErrorState, LoadingState } from '@/components/States';
import { ChevronRightIcon, ClipboardIcon, HomeIcon } from '@/components/Icons';
import { useApiData } from '@/lib/useApiData';

export default function AdminHomePage() {
  return (
    <AppShell role="admin">
      {(user) => (
        <>
          <PageHeader icon={<HomeIcon className="h-7 w-7" />} title="หน้าหลัก" subtitle={`สวัสดี ${user.fullName}`} />
          <PendingCount />
        </>
      )}
    </AppShell>
  );
}

function PendingCount() {
  const { data, error, loading, reload } = useApiData('/loans');

  if (loading) return <LoadingState />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const pending = data.loans.filter((l) => l.status === 'requested').length;

  return (
    <Link
      href="/admin/loans"
      className="card group flex max-w-xl items-center gap-5 p-6 transition hover:-translate-y-0.5 sm:p-8"
    >
      <span className="rounded-2xl bg-orange-50 p-4 text-orange-500 ring-1 ring-inset ring-orange-100">
        <ClipboardIcon className="h-9 w-9" />
      </span>
      <div className="flex-1">
        <p className="text-slate-500">คำขอที่รออนุมัติ</p>
        <p className="text-4xl font-bold text-slate-800" data-testid="pending-count">
          {pending} <span className="text-lg font-semibold text-slate-500">รายการ</span>
        </p>
        <p className="mt-1 text-sm text-blue-700">
          {pending > 0 ? 'กดเพื่อไปตรวจสอบและอนุมัติ' : 'ไม่มีคำขอค้างอยู่ตอนนี้'}
        </p>
      </div>
      <ChevronRightIcon className="h-6 w-6 text-slate-400 transition group-hover:translate-x-1 group-hover:text-blue-700" />
    </Link>
  );
}
