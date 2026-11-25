'use client';
// หน้าคำขอของฉัน (member): ดูคำขอทั้งหมดของตัวเอง, คำขอที่อนุมัติแล้วมีปุ่ม "คืนอุปกรณ์"
import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImageModal from '@/components/ImageModal';
import { EquipmentImage } from '@/components/EquipmentCard';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { BoxIcon, ListIcon, ReturnIcon } from '@/components/Icons';
import { useApiData } from '@/lib/useApiData';
import { formatDateTime } from '@/lib/format';

export default function MyLoansPage() {
  return (
    <AppShell role="member">
      {() => (
        <>
          <PageHeader icon={<ListIcon className="h-7 w-7" />} title="คำขอของฉัน" subtitle="ติดตามสถานะคำขอยืมและคืนอุปกรณ์" />
          <MyLoanList />
        </>
      )}
    </AppShell>
  );
}

function MyLoanList() {
  const { data, error, loading, reload } = useApiData('/loans');
  const [viewing, setViewing] = useState(null); // คำขอที่กำลังเปิดดูรูปตอนคืน

  if (loading) return <LoadingState variant="list" count={3} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;
  if (data.loans.length === 0) {
    return (
      <EmptyState
        icon={<ListIcon className="h-10 w-10" />}
        title="ยังไม่มีคำขอยืม"
        message="เลือกอุปกรณ์ที่ต้องการแล้วกด &quot;ขอยืม&quot; คำขอจะแสดงที่นี่"
        action={<Link href="/equipment" className="btn-primary"><BoxIcon /> ไปเลือกอุปกรณ์</Link>}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-4">
        {data.loans.map((loan) => (
          <article key={loan.id} className="card flex gap-4 p-4 sm:p-5">
            <EquipmentImage src={loan.equipment.imageUrl} alt={loan.equipment.name} className="aspect-[4/3] w-20 shrink-0 self-start rounded-xl sm:w-40 sm:rounded-2xl" />

            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold text-slate-800">{loan.equipment.name}</h2>
                <StatusBadge status={loan.status} />
              </div>
              <p className="break-words text-sm text-slate-600">
                <span className="text-slate-400">วัตถุประสงค์: </span>
                {loan.purpose || '-'}
              </p>
              <dl className="grid grid-cols-1 gap-x-6 gap-y-0.5 text-sm text-slate-500 sm:grid-cols-3">
                <div><dt className="inline text-slate-400">ขอยืม: </dt><dd className="inline">{formatDateTime(loan.requestedAt)}</dd></div>
                <div><dt className="inline text-slate-400">ตัดสิน: </dt><dd className="inline">{formatDateTime(loan.decidedAt)}</dd></div>
                <div><dt className="inline text-slate-400">คืน: </dt><dd className="inline">{formatDateTime(loan.returnedAt)}</dd></div>
              </dl>

              <div className="mt-auto flex flex-wrap gap-2 pt-2">
                {loan.status === 'approved' && (
                  <Link href={`/my-loans/${loan.id}/return`} className="btn-primary">
                    <ReturnIcon /> คืนอุปกรณ์
                  </Link>
                )}
                {loan.returnImageUrl && (
                  <button onClick={() => setViewing(loan)} className="btn-outline">ดูรูปตอนคืน</button>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>

      {viewing && (
        <ImageModal
          src={viewing.returnImageUrl}
          title={`รูปตอนคืน: ${viewing.equipment.name}`}
          onClose={() => setViewing(null)}
        />
      )}
    </>
  );
}
