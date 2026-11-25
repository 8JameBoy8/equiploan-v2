'use client';
// หน้าจัดการอุปกรณ์ของ admin: ดูรายการ + ปุ่มเพิ่ม + ปุ่มแก้ไข/ลบบนการ์ด
import { useState } from 'react';
import Link from 'next/link';
import AppShell from '@/components/AppShell';
import ConfirmDialog from '@/components/ConfirmDialog';
import EquipmentGrid from '@/components/EquipmentGrid';
import PageHeader from '@/components/PageHeader';
import { BoxIcon, EditIcon, PlusIcon, TrashIcon } from '@/components/Icons';
import { api } from '@/lib/api';

export default function AdminEquipmentPage() {
  return (
    <AppShell role="admin">
      {() => (
        <>
          <PageHeader
            icon={<BoxIcon className="h-7 w-7" />}
            title="จัดการอุปกรณ์"
            subtitle="เพิ่ม แก้ไข หรือลบอุปกรณ์ของชมรม"
            action={
              <Link href="/admin/equipment/new" className="btn-primary">
                <PlusIcon /> เพิ่มอุปกรณ์
              </Link>
            }
          />
          <EquipmentManager />
        </>
      )}
    </AppShell>
  );
}

function EquipmentManager() {
  // deleting = { item, reload } ของอุปกรณ์ที่กำลังถามยืนยันลบ (null = ไม่ได้เปิดหน้าต่าง)
  const [deleting, setDeleting] = useState(null);
  const [busy, setBusy] = useState(false);
  const [dialogError, setDialogError] = useState('');
  const [message, setMessage] = useState('');

  function closeDialog() {
    setDeleting(null);
    setDialogError('');
  }

  async function confirmDelete() {
    setBusy(true);
    setDialogError('');
    let res;
    try {
      res = await api(`/equipment/${deleting.item.id}`, { method: 'DELETE' });
    } catch {
      res = { ok: false, data: { error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่' } };
    }
    setBusy(false);
    if (!res.ok) {
      // ลบไม่ได้ (เช่น มีคำขอค้างอยู่) แสดงเหตุผลในหน้าต่างเดิม
      setDialogError(res.data?.error || 'ลบไม่สำเร็จ');
      return;
    }
    setMessage(`ลบ "${deleting.item.name}" แล้ว`);
    deleting.reload(); // โหลดรายการใหม่ อุปกรณ์ที่ลบจะหายไป
    closeDialog();
  }

  return (
    <>
      {message && (
        <p role="status" className="mb-4 rounded-xl bg-green-50 px-4 py-2.5 text-sm text-green-700 ring-1 ring-inset ring-green-200">
          {message}
        </p>
      )}

      <EquipmentGrid
        emptyAction={<Link href="/admin/equipment/new" className="btn-primary"><PlusIcon /> เพิ่มอุปกรณ์ชิ้นแรก</Link>}
        renderAction={(item, reload) => (
          <div className="grid grid-cols-2 gap-2">
            <Link href={`/admin/equipment/${item.id}/edit`} className="btn-outline btn-sm">
              <EditIcon className="h-4 w-4" /> แก้ไข
            </Link>
            <button
              onClick={() => {
                setMessage('');
                setDeleting({ item, reload });
              }}
              className="btn-danger btn-sm"
            >
              <TrashIcon className="h-4 w-4" /> ลบ
            </button>
          </div>
        )}
      />

      {deleting && (
        <ConfirmDialog
          title="ลบอุปกรณ์นี้?"
          message={`"${deleting.item.name}" จะไม่แสดงในรายการและขอยืมไม่ได้อีก ส่วนประวัติคำขอยืมเก่ายังอยู่ครบ`}
          confirmLabel="ลบอุปกรณ์"
          busy={busy}
          error={dialogError}
          onConfirm={confirmDelete}
          onCancel={closeDialog}
        />
      )}
    </>
  );
}
