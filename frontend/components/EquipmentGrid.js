'use client';
// โหลดรายการอุปกรณ์จาก BE แล้วแสดงเป็นตารางการ์ด
//   renderAction(item, reload): ส่วนท้ายของการ์ดแต่ละใบ (ไม่ใส่ก็ได้)
//     reload = ฟังก์ชันโหลดรายการใหม่ (เช่น หลังลบอุปกรณ์)
//   emptyAction: ปุ่มที่แสดงเมื่อยังไม่มีอุปกรณ์ (ไม่ใส่ก็ได้)
import { useApiData } from '@/lib/useApiData';
import EquipmentCard from './EquipmentCard';
import { EmptyState, ErrorState, LoadingState } from './States';

export default function EquipmentGrid({ renderAction, emptyAction }) {
  const { data, error, loading, reload } = useApiData('/equipment');

  if (loading) return <LoadingState variant="cards" count={8} />;
  if (error) return <ErrorState message={error} onRetry={reload} />;

  const items = data.equipment;
  if (items.length === 0) {
    return <EmptyState title="ยังไม่มีอุปกรณ์" message="เมื่อผู้ดูแลเพิ่มอุปกรณ์แล้ว รายการจะแสดงที่นี่" action={emptyAction} />;
  }

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {items.map((item) => (
        <EquipmentCard key={item.id} item={item} action={renderAction?.(item, reload)} />
      ))}
    </div>
  );
}
