'use client';
// หน้าแก้ไขอุปกรณ์ (admin): โหลดข้อมูลเดิมก่อน แล้วค่อยแสดงฟอร์ม
import Link from 'next/link';
import { useParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import EquipmentForm from '@/components/EquipmentForm';
import PageHeader from '@/components/PageHeader';
import { ErrorState, LoadingState } from '@/components/States';
import { EditIcon } from '@/components/Icons';
import { useApiData } from '@/lib/useApiData';

export default function EditEquipmentPage() {
  return (
    <AppShell role="admin">
      {() => (
        <>
          <PageHeader icon={<EditIcon className="h-7 w-7" />} title="แก้ไขอุปกรณ์" subtitle="แก้ข้อมูลหรือเปลี่ยนรูปอุปกรณ์" />
          <EditLoader />
        </>
      )}
    </AppShell>
  );
}

function EditLoader() {
  const { id } = useParams();
  const { data, error, loading, reload } = useApiData(`/equipment/${id}`);

  if (loading) return <LoadingState />;
  if (error) {
    return (
      <ErrorState
        message={error}
        onRetry={reload}
        action={<Link href="/admin/equipment" className="btn-outline">กลับไปรายการอุปกรณ์</Link>}
      />
    );
  }
  return <EquipmentForm item={data.equipment} />;
}
