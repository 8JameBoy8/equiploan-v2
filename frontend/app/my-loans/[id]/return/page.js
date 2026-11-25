'use client';
// ฟอร์มคืนอุปกรณ์ (member): ต้องเลือกรูปถ่ายก่อน ปุ่มยืนยันจึงจะกดได้
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import AppShell from '@/components/AppShell';
import PageHeader from '@/components/PageHeader';
import ImagePicker from '@/components/ImagePicker';
import { EquipmentImage } from '@/components/EquipmentCard';
import { ErrorBox, FormRow, InfoNote, SectionTitle } from '@/components/FormParts';
import { ErrorState, LoadingState } from '@/components/States';
import { CheckIcon, ReturnIcon } from '@/components/Icons';
import { api } from '@/lib/api';
import { useApiData } from '@/lib/useApiData';
import { formatDateTime } from '@/lib/format';

export default function ReturnPage() {
  return (
    <AppShell role="member">
      {() => (
        <>
          <PageHeader icon={<ReturnIcon className="h-7 w-7" />} title="คืนอุปกรณ์" subtitle="แนบรูปถ่ายอุปกรณ์เพื่อยืนยันการคืน" />
          <ReturnForm />
        </>
      )}
    </AppShell>
  );
}

function ReturnForm() {
  const { id } = useParams();
  const router = useRouter();
  const { data, error: loadError, loading, reload } = useApiData('/loans'); // BE ส่งมาเฉพาะคำขอของเรา
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  // คืนหน่วยความจำของรูปพรีวิว
  useEffect(() => {
    return () => preview && URL.revokeObjectURL(preview);
  }, [preview]);

  const backLink = <Link href="/my-loans" className="btn-outline">กลับไปหน้าคำขอของฉัน</Link>;
  if (loading) return <LoadingState />;
  if (loadError) return <ErrorState message={loadError} onRetry={reload} action={backLink} />;

  const loan = data.loans.find((l) => String(l.id) === String(id));
  if (!loan) return <ErrorState title="ไม่พบคำขอนี้" message="คำขอนี้ไม่อยู่ในรายการของคุณ" action={backLink} />;
  if (loan.status !== 'approved') {
    return <ErrorState title="คืนไม่ได้" message="คืนได้เฉพาะคำขอที่อนุมัติแล้ว" action={backLink} />;
  }

  function pickFile(chosen) {
    setFile(chosen);
    setPreview(URL.createObjectURL(chosen));
  }

  function removeFile() {
    setFile(null);
    setPreview(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!file) {
      setError('กรุณาแนบรูปถ่ายอุปกรณ์ตอนคืน');
      return;
    }
    setError('');
    setSending(true);
    const form = new FormData();
    form.append('image', file);
    let res;
    try {
      res = await api(`/loans/${id}/return`, { method: 'POST', body: form });
    } catch {
      res = { ok: false, data: { error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่' } };
    }
    setSending(false);
    if (!res.ok) {
      setError(res.data?.error || 'คืนอุปกรณ์ไม่สำเร็จ');
      return;
    }
    router.push('/my-loans');
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="card flex flex-col gap-5 p-5 sm:p-8">
        <SectionTitle icon={<CheckIcon />}>ข้อมูลการคืน</SectionTitle>

        <FormRow label="รายการที่คืน">
          <div className="flex items-center gap-4 rounded-2xl bg-blue-50/60 p-3 ring-1 ring-inset ring-blue-100">
            <EquipmentImage src={loan.equipment.imageUrl} alt={loan.equipment.name} className="h-16 w-20 shrink-0 rounded-xl" />
            <div className="min-w-0">
              <p className="font-semibold text-slate-800">{loan.equipment.name}</p>
              <p className="text-sm text-slate-500">อนุมัติเมื่อ {formatDateTime(loan.decidedAt)}</p>
            </div>
          </div>
        </FormRow>

        <FormRow label="รูปภาพยืนยันการคืน" required htmlFor="return-image">
          <ImagePicker
            id="return-image"
            hasFile={Boolean(file)}
            previewSrc={preview}
            previewAlt="ตัวอย่างรูปที่จะส่ง"
            onPick={pickFile}
            onError={setError}
            onRemove={removeFile}
          />
        </FormRow>

        <ErrorBox message={error} />
      </div>

      <button type="submit" disabled={!file || sending} className="btn-primary mx-auto w-full max-w-md py-3 text-lg">
        <CheckIcon /> {sending ? 'กำลังส่ง...' : file ? 'ยืนยันการคืน' : 'เลือกรูปก่อนจึงจะยืนยันได้'}
      </button>
      <div className="mx-auto w-full max-w-2xl">
        <InfoNote>เมื่อยืนยันแล้ว สถานะคำขอจะเปลี่ยนเป็น &quot;คืนแล้ว&quot; และผู้ดูแลจะเห็นรูปที่คุณแนบ</InfoNote>
      </div>
    </form>
  );
}
