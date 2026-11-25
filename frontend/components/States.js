// หน้าแสดงสถานะ 3 แบบที่ใช้ร่วมกันทุกหน้า: กำลังโหลด / ไม่มีข้อมูล / เกิดข้อผิดพลาด
import { AlertIcon, BoxIcon } from './Icons';

// กำลังโหลด: โครงสีเทากะพริบ (skeleton) ให้รู้ว่ากำลังมีข้อมูลมา
//   variant: 'cards' = ตารางการ์ด, 'list' = รายการแนวนอน, 'block' = กล่องเดียว
export function LoadingState({ variant = 'block', count = 4 }) {
  const bar = 'animate-pulse rounded-lg bg-slate-200/80';
  if (variant === 'cards') {
    return (
      <div role="status" aria-label="กำลังโหลด" className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="card overflow-hidden">
            <div className="aspect-[4/3] animate-pulse bg-slate-200/70" />
            <div className="space-y-3 p-4">
              <div className={`${bar} h-4 w-3/4`} />
              <div className={`${bar} h-3 w-1/3`} />
              <div className={`${bar} h-9 w-full`} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  if (variant === 'list') {
    return (
      <div role="status" aria-label="กำลังโหลด" className="flex flex-col gap-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="card flex gap-4 p-4">
            <div className="h-20 w-24 shrink-0 animate-pulse rounded-xl bg-slate-200/70" />
            <div className="flex-1 space-y-3">
              <div className={`${bar} h-4 w-1/2`} />
              <div className={`${bar} h-3 w-3/4`} />
              <div className={`${bar} h-3 w-1/3`} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div role="status" aria-label="กำลังโหลด" className="card space-y-4 p-6">
      <div className={`${bar} h-5 w-1/3`} />
      <div className={`${bar} h-4 w-full`} />
      <div className={`${bar} h-4 w-5/6`} />
      <div className={`${bar} h-10 w-40`} />
    </div>
  );
}

// ไม่มีข้อมูล: ไอคอน + หัวข้อ + คำอธิบาย + ปุ่มพาไปทำต่อ (ไม่ใส่ก็ได้)
export function EmptyState({ icon, title, message, action }) {
  return (
    <div className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-blue-50 p-5 text-blue-400">{icon || <BoxIcon className="h-10 w-10" />}</div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {message && <p className="mt-1 max-w-sm text-slate-500">{message}</p>}
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}

// เกิดข้อผิดพลาด: ไอคอนสีแดง + ข้อความ + ปุ่ม "ลองใหม่" (ถ้าส่ง onRetry มา)
export function ErrorState({ title = 'เกิดข้อผิดพลาด', message, onRetry, action }) {
  return (
    <div role="alert" className="card flex flex-col items-center px-6 py-12 text-center">
      <div className="mb-4 rounded-full bg-red-50 p-5 text-red-500"><AlertIcon className="h-10 w-10" /></div>
      <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
      {message && <p className="mt-1 max-w-sm text-slate-500">{message}</p>}
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {onRetry && <button onClick={onRetry} className="btn-primary">ลองใหม่</button>}
        {action}
      </div>
    </div>
  );
}
