'use client';
// หน้าเพิ่มอุปกรณ์ (admin)
import AppShell from '@/components/AppShell';
import EquipmentForm from '@/components/EquipmentForm';
import PageHeader from '@/components/PageHeader';
import { PlusIcon } from '@/components/Icons';

export default function NewEquipmentPage() {
  return (
    <AppShell role="admin">
      {() => (
        <>
          <PageHeader icon={<PlusIcon className="h-7 w-7" />} title="เพิ่มอุปกรณ์" subtitle="กรอกข้อมูลและแนบรูปอุปกรณ์" />
          <EquipmentForm item={null} />
        </>
      )}
    </AppShell>
  );
}
