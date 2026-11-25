// การ์ดแสดงอุปกรณ์หนึ่งชิ้น: รูป (หรือภาพแทน), ชื่อ, หมวด, ป้ายสถานะ
import { BoxIcon } from './Icons';
import StatusBadge from './StatusBadge';

// รูปอุปกรณ์ ถ้าไม่มีรูปแสดงกล่องสีฟ้าอ่อนพร้อมไอคอนแทน
export function EquipmentImage({ src, alt, className = '' }) {
  if (!src) {
    return (
      <div
        role="img"
        aria-label={`${alt} (ไม่มีรูป)`}
        className={`flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 text-blue-300 ${className}`}
      >
        <BoxIcon className="h-1/3 max-h-14 w-1/3 max-w-14" />
      </div>
    );
  }
  return <img src={src} alt={alt} className={`bg-slate-100 object-cover ${className}`} />;
}

// action: ปุ่มหรือลิงก์ด้านล่างการ์ด (เช่น ปุ่มขอยืม/แก้ไข) ไม่ใส่ก็ได้
export default function EquipmentCard({ item, action }) {
  return (
    <article className="card flex flex-col overflow-hidden transition hover:-translate-y-0.5 hover:shadow-[0_14px_34px_-14px_rgba(30,64,175,0.35)]">
      <EquipmentImage src={item.imageUrl} alt={item.name} className="aspect-[4/3] w-full" />
      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-start justify-between gap-2">
          <h2 className="font-semibold leading-snug text-slate-800">{item.name}</h2>
          <StatusBadge status={item.status} />
        </div>
        <p className="w-fit rounded-md bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{item.category}</p>
        {item.description && <p className="line-clamp-2 text-sm text-slate-500">{item.description}</p>}
        {action && <div className="mt-auto pt-3">{action}</div>}
      </div>
    </article>
  );
}
