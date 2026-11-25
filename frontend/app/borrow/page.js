'use client';
// ฟอร์มขอยืม (member)
//   - เลือกได้เฉพาะอุปกรณ์ที่ว่าง
//   - เลือกแล้วแสดงรูปและชื่ออุปกรณ์ทันที
//   - ถ้ามาจากปุ่ม "ขอยืม" บนการ์ด (/borrow?equipmentId=3) จะเลือกอุปกรณ์นั้นไว้ให้
import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import { EquipmentImage } from '@/components/EquipmentCard';
import { ErrorBox, FormRow, InfoNote, SectionTitle } from '@/components/FormParts';
import { EmptyState, ErrorState, LoadingState } from '@/components/States';
import { ClipboardIcon, SendIcon } from '@/components/Icons';
import { api } from '@/lib/api';
import { useApiData } from '@/lib/useApiData';

const MAX_PURPOSE = 500;

export default function BorrowPage() {
  return (
    <AppShell role="member">
      {() => (
        <>
          <PageHeader icon={<SendIcon className="h-7 w-7" />} title="ยืมอุปกรณ์" subtitle="กรุณาเลือกอุปกรณ์และกรอกข้อมูลการยืม" />
          {/* useSearchParams ต้องอยู่ใน Suspense ตามข้อกำหนดของ Next.js */}
          <Suspense fallback={<LoadingState />}>
            <BorrowForm />
          </Suspense>
        </>
      )}
    </AppShell>
  );
}

function BorrowForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { data, error: loadError, loading, reload } = useApiData('/equipment');
  const [selectedId, setSelectedId] = useState('');
  const [purpose, setPurpose] = useState('');
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  // เก็บเฉพาะอุปกรณ์ที่ว่าง
  const available = data ? data.equipment.filter((e) => e.status === 'available') : [];

  // เลือกอุปกรณ์จาก ?equipmentId= ไว้ให้ ถ้าอุปกรณ์นั้นยังว่างอยู่
  useEffect(() => {
    if (!data) return;
    const fromCard = searchParams.get('equipmentId');
    if (!fromCard) return;
    const stillFree = data.equipment.some((e) => String(e.id) === fromCard && e.status === 'available');
    if (stillFree) setSelectedId(fromCard);
    else setNotice('อุปกรณ์ที่เลือกมาไม่ว่างแล้ว กรุณาเลือกชิ้นอื่น');
  }, [data, searchParams]);

  const selected = available.find((e) => String(e.id) === selectedId);
  const purposeLength = [...purpose].length; // นับเป็นตัวอักษรจริงเหมือน BE

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!selected) {
      setError('กรุณาเลือกอุปกรณ์');
      return;
    }
    if (purposeLength > MAX_PURPOSE) {
      setError(`วัตถุประสงค์ยาวเกิน ${MAX_PURPOSE} ตัวอักษร`);
      return;
    }
    setSending(true);
    let res;
    try {
      res = await api('/loans', { method: 'POST', body: { equipmentId: selected.id, purpose } });
    } catch {
      res = { ok: false, data: { error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่' } };
    }
    setSending(false);
    if (!res.ok) {
      setError(res.data?.error || 'ส่งคำขอไม่สำเร็จ');
      return;
    }
    router.push('/my-loans');
  }

  if (loading) return <LoadingState />;
  if (loadError) return <ErrorState message={loadError} onRetry={reload} />;
  if (available.length === 0) {
    return (
      <EmptyState
        title="ตอนนี้ไม่มีอุปกรณ์ที่ว่าง"
        message="อุปกรณ์ทุกชิ้นถูกยืมอยู่ ลองกลับมาดูใหม่ภายหลัง"
        action={<Link href="/equipment" className="btn-outline">ดูรายการอุปกรณ์</Link>}
      />
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="card grid gap-8 p-5 sm:p-8 lg:grid-cols-[260px_1fr]">
        {/* ซ้าย: รูปและชื่อของอุปกรณ์ที่เลือก */}
        <div className="flex flex-col gap-3">
          <EquipmentImage
            src={selected?.imageUrl}
            alt={selected?.name || 'ยังไม่ได้เลือกอุปกรณ์'}
            className="aspect-[4/3] w-full rounded-2xl"
          />
          <div className="text-center">
            <p className="font-semibold text-slate-800" data-testid="selected-name">
              {selected ? selected.name : 'ยังไม่ได้เลือกอุปกรณ์'}
            </p>
            {selected && <p className="text-sm text-slate-500">{selected.category}</p>}
          </div>
        </div>

        {/* ขวา: ข้อมูลการยืม */}
        <div className="flex flex-col gap-5">
          <SectionTitle icon={<ClipboardIcon />}>ข้อมูลการยืม</SectionTitle>
          {notice && <p className="rounded-xl bg-orange-50 px-4 py-2.5 text-sm text-orange-700 ring-1 ring-inset ring-orange-200">{notice}</p>}

          <FormRow label="เลือกอุปกรณ์" required htmlFor="borrow-equipment">
            <select
              id="borrow-equipment"
              value={selectedId}
              onChange={(e) => {
                setSelectedId(e.target.value);
                setNotice('');
              }}
              required
              className="input"
            >
              <option value="">กรุณาเลือกอุปกรณ์</option>
              {available.map((e) => (
                <option key={e.id} value={String(e.id)}>
                  {e.name} ({e.category})
                </option>
              ))}
            </select>
          </FormRow>

          <FormRow
            label="วัตถุประสงค์การยืม"
            htmlFor="borrow-purpose"
            hint={
              <span className={`block text-right ${purposeLength > MAX_PURPOSE ? 'font-semibold text-red-600' : ''}`}>
                {purposeLength}/{MAX_PURPOSE}
              </span>
            }
          >
            <textarea
              id="borrow-purpose"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="ระบุวัตถุประสงค์ (ถ้ามี)"
              className="input min-h-28"
            />
          </FormRow>

          <ErrorBox message={error} />
        </div>
      </div>

      <button
        type="submit"
        disabled={sending || !selected || purposeLength > MAX_PURPOSE}
        className="btn-primary mx-auto w-full max-w-md py-3 text-lg"
      >
        <SendIcon /> {sending ? 'กำลังส่ง...' : 'ยืนยันการยืม'}
      </button>
      <div className="mx-auto w-full max-w-2xl">
        <InfoNote>หลังส่งคำขอ สถานะจะเป็น &quot;รออนุมัติ&quot; จนกว่าผู้ดูแลจะตรวจสอบ ดูความคืบหน้าได้ที่เมนู &quot;คำขอของฉัน&quot;</InfoNote>
      </div>
    </form>
  );
}
