'use client';
// หน้าจัดการคำขอ (admin): ดูวัตถุประสงค์, อนุมัติ/ปฏิเสธ, ดูรูปที่แนบตอนคืน (อยู่ในหน้านี้เลย)
//   จอใหญ่แสดงเป็นตาราง / มือถือแสดงเป็นการ์ด
import { useState } from 'react';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import StatusBadge from '@/components/StatusBadge';
import ImageModal from '@/components/ImageModal';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { CheckIcon, ListIcon, XIcon } from '@/components/Icons';
import { api } from '@/lib/api';
import { useApiData } from '@/lib/useApiData';
import { formatDateTime } from '@/lib/format';

export default function AdminLoansPage() {
  return (
    <AppShell role="admin">
      {() => (
        <>
          <PageHeader icon={<ListIcon className="h-7 w-7" />} title="จัดการการยืม-คืน" subtitle="ตรวจสอบรายการยืม และจัดการสถานะการยืม" />
          <LoanManager />
        </>
      )}
    </AppShell>
  );
}

function LoanManager() {
  const { data, error, loading, reload } = useApiData('/loans');
  const [tab, setTab] = useState('requested'); // requested = รออนุมัติ, all = ทั้งหมด
  const [message, setMessage] = useState({ type: '', text: '' });
  const [busyId, setBusyId] = useState(null);
  const [viewing, setViewing] = useState(null); // คำขอที่กำลังเปิดดูรูปคืน

  // อนุมัติหรือปฏิเสธ แล้วโหลดรายการใหม่
  async function decide(loan, action) {
    setBusyId(loan.id);
    setMessage({ type: '', text: '' });
    let res;
    try {
      res = await api(`/loans/${loan.id}/${action}`, { method: 'POST' });
    } catch {
      res = { ok: false, data: { error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่' } };
    }
    setBusyId(null);
    if (res.ok) {
      const verb = action === 'approve' ? 'อนุมัติ' : 'ปฏิเสธ';
      setMessage({ type: 'ok', text: `${verb}คำขอของ ${loan.borrower.name} (${loan.equipment.name}) แล้ว` });
    } else {
      setMessage({ type: 'error', text: res.data?.error || 'ดำเนินการไม่สำเร็จ' });
    }
    reload();
  }

  if (loading && !data) return <LoadingState variant="list" count={3} />;
  if (error && !data) return <ErrorState message={error} onRetry={reload} />;

  const loans = data.loans;
  const pendingCount = loans.filter((l) => l.status === 'requested').length;
  const shown = tab === 'requested' ? loans.filter((l) => l.status === 'requested') : loans;
  const tabClass = (name) =>
    `-mb-px flex shrink-0 items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 font-semibold transition ${
      tab === name ? 'border-blue-700 text-blue-700' : 'border-transparent text-slate-500 hover:text-blue-700'
    }`;

  // ปุ่มจัดการของแต่ละคำขอ (ใช้ทั้งในตารางและการ์ดมือถือ)
  const actions = (loan) => (
    <div className="flex flex-wrap items-center gap-2">
      {loan.status === 'requested' && (
        <>
          <button onClick={() => decide(loan, 'approve')} disabled={busyId === loan.id} className="btn-primary btn-sm">
            <CheckIcon className="h-4 w-4" /> อนุมัติ
          </button>
          <button onClick={() => decide(loan, 'reject')} disabled={busyId === loan.id} className="btn-danger btn-sm">
            <XIcon className="h-4 w-4" /> ปฏิเสธ
          </button>
        </>
      )}
      {loan.returnImageUrl && (
        // รูปย่อของรูปตอนคืน กดแล้วเปิดรูปใหญ่
        <button
          onClick={() => setViewing(loan)}
          className="flex items-center gap-2 rounded-lg p-1 pr-3 text-sm font-semibold text-blue-700 ring-1 ring-blue-200 hover:bg-blue-50"
        >
          <img src={loan.returnImageUrl} alt="" className="h-9 w-9 rounded-md object-cover" />
          ดูรูปคืน
        </button>
      )}
      {loan.status !== 'requested' && !loan.returnImageUrl && <span className="text-sm text-slate-400">-</span>}
    </div>
  );

  return (
    <div className="card p-4 sm:p-6">
      {/* แท็บ */}
      <div className="mb-4 flex gap-1 overflow-x-auto overflow-y-hidden border-b border-slate-200">
        <button onClick={() => setTab('requested')} className={tabClass('requested')}>
          รายการที่รออนุมัติ
          {pendingCount > 0 && <span className="rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">{pendingCount}</span>}
        </button>
        <button onClick={() => setTab('all')} className={tabClass('all')}>รายการทั้งหมด</button>
      </div>

      {message.text && (
        <p
          role={message.type === 'error' ? 'alert' : 'status'}
          className={`mb-4 rounded-xl px-4 py-2.5 text-sm ring-1 ring-inset ${
            message.type === 'error' ? 'bg-red-50 text-red-700 ring-red-200' : 'bg-green-50 text-green-700 ring-green-200'
          }`}
        >
          {message.text}
        </p>
      )}

      {shown.length === 0 ? (
        <div className="py-4">
          <EmptyState
            icon={<ListIcon className="h-10 w-10" />}
            title={tab === 'requested' ? 'ไม่มีคำขอที่รออนุมัติ' : 'ยังไม่มีคำขอยืม'}
            message={tab === 'requested' ? 'คำขอใหม่จากสมาชิกจะแสดงที่นี่' : 'เมื่อสมาชิกส่งคำขอยืม รายการจะแสดงที่นี่'}
          />
        </div>
      ) : (
        <>
          {/* จอใหญ่: ตาราง */}
          <div className="hidden overflow-hidden rounded-2xl ring-1 ring-slate-200 md:block">
            <table className="w-full text-left text-sm">
              <thead className="bg-blue-50/70 text-slate-600">
                <tr>
                  <th className="px-3 py-3 font-semibold">#</th>
                  <th className="px-3 py-3 font-semibold">ผู้ยืม</th>
                  <th className="px-3 py-3 font-semibold">อุปกรณ์</th>
                  <th className="px-3 py-3 font-semibold">วัตถุประสงค์</th>
                  <th className="px-3 py-3 font-semibold">วันที่ขอ</th>
                  <th className="px-3 py-3 font-semibold">สถานะ</th>
                  <th className="px-3 py-3 font-semibold">การจัดการ</th>
                </tr>
              </thead>
              <tbody>
                {shown.map((loan, index) => (
                  <tr key={loan.id} className="border-t border-slate-100 align-top hover:bg-slate-50/60">
                    <td className="px-3 py-3 text-slate-400">{index + 1}</td>
                    <td className="px-3 py-3">
                      <p className="font-medium text-slate-800">{loan.borrower.name}</p>
                      <p className="text-xs text-slate-400">{loan.borrower.email}</p>
                    </td>
                    <td className="px-3 py-3">{loan.equipment.name}</td>
                    <td className="max-w-xs whitespace-pre-wrap break-words px-3 py-3 text-slate-600">{loan.purpose || '-'}</td>
                    <td className="whitespace-nowrap px-3 py-3 text-slate-500">
                      {formatDateTime(loan.requestedAt)}
                      {loan.returnedAt && <p className="text-xs text-slate-400">คืน {formatDateTime(loan.returnedAt)}</p>}
                    </td>
                    <td className="px-3 py-3"><StatusBadge status={loan.status} /></td>
                    <td className="px-3 py-3">{actions(loan)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* มือถือ: การ์ด */}
          <div className="flex flex-col gap-3 md:hidden">
            {shown.map((loan) => (
              <article key={loan.id} className="rounded-2xl p-4 ring-1 ring-slate-200">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">{loan.equipment.name}</p>
                    <p className="truncate text-sm text-slate-500">{loan.borrower.name} · {loan.borrower.email}</p>
                  </div>
                  <StatusBadge status={loan.status} />
                </div>
                <p className="mt-2 break-words text-sm text-slate-600">
                  <span className="text-slate-400">วัตถุประสงค์: </span>{loan.purpose || '-'}
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  ขอเมื่อ {formatDateTime(loan.requestedAt)}
                  {loan.returnedAt && ` · คืนเมื่อ ${formatDateTime(loan.returnedAt)}`}
                </p>
                <div className="mt-3">{actions(loan)}</div>
              </article>
            ))}
          </div>
        </>
      )}

      {viewing && (
        <ImageModal
          src={viewing.returnImageUrl}
          title={`หลักฐานการคืน: ${viewing.equipment.name} — ${viewing.borrower.name}`}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  );
}
