// ป้ายสีแสดงสถานะ (มีจุดสีนำหน้า) ใช้ทั้งสถานะคำขอยืมและสถานะอุปกรณ์
const STATUS = {
  // สถานะคำขอยืม
  requested: { label: 'รออนุมัติ', style: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-orange-500' },
  approved: { label: 'อนุมัติแล้ว', style: 'bg-blue-50 text-blue-700 ring-blue-200', dot: 'bg-blue-600' },
  rejected: { label: 'ปฏิเสธ', style: 'bg-red-50 text-red-700 ring-red-200', dot: 'bg-red-500' },
  returned: { label: 'คืนแล้ว', style: 'bg-green-50 text-green-700 ring-green-200', dot: 'bg-green-600' },
  // สถานะอุปกรณ์
  available: { label: 'ว่าง', style: 'bg-green-50 text-green-700 ring-green-200', dot: 'bg-green-600' },
  borrowed: { label: 'ถูกยืม', style: 'bg-orange-50 text-orange-700 ring-orange-200', dot: 'bg-orange-500' },
};

export default function StatusBadge({ status }) {
  const s = STATUS[status] || { label: status, style: 'bg-slate-50 text-slate-600 ring-slate-200', dot: 'bg-slate-400' };
  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${s.style}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} aria-hidden="true" />
      {s.label}
    </span>
  );
}
