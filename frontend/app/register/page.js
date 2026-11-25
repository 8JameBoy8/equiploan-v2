'use client';
// หน้าสมัครสมาชิก (ได้บทบาท member เสมอ)
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard, { IconInput, ErrorBox } from '@/components/AuthCard';
import { LockIcon, MailIcon, PlusIcon, UserIcon } from '@/components/Icons';
import { api } from '@/lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    // ตรวจเบื้องต้นที่ FE เพื่อความสะดวก (BE ตรวจซ้ำอีกครั้งเสมอ)
    if (password.length < 8) {
      setError('รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร');
      return;
    }
    if (password !== confirm) {
      setError('รหัสผ่านทั้งสองช่องไม่ตรงกัน');
      return;
    }

    setLoading(true);
    let res;
    try {
      res = await api('/auth/register', { method: 'POST', body: { fullName, email, password } });
    } catch {
      res = { ok: false, data: { error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่' } };
    }
    setLoading(false);

    if (!res.ok) {
      setError(res.data?.error || 'สมัครสมาชิกไม่สำเร็จ');
      return;
    }
    router.replace('/'); // สมัครแล้วล็อกอินให้ทันที ไปหน้าหลักของสมาชิก
  }

  return (
    <AuthCard icon={<UserIcon className="h-8 w-8" />} title="สมัครสมาชิก" subtitle="สร้างบัญชีเพื่อยืมอุปกรณ์ของชมรม">
      <form onSubmit={handleSubmit} className="space-y-4">
        <IconInput
          icon={<UserIcon />}
          placeholder="ชื่อ-นามสกุล"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          required
          maxLength={100}
          autoComplete="name"
        />
        <IconInput
          icon={<MailIcon />}
          type="email"
          placeholder="อีเมล"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <IconInput
          icon={<LockIcon />}
          type="password"
          placeholder="รหัสผ่าน (อย่างน้อย 8 ตัวอักษร)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="new-password"
        />
        <IconInput
          icon={<LockIcon />}
          type="password"
          placeholder="ยืนยันรหัสผ่าน"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          autoComplete="new-password"
        />
        <ErrorBox message={error} />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          <PlusIcon /> {loading ? 'กำลังสมัคร...' : 'สมัครสมาชิก'}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600">
        มีบัญชีอยู่แล้ว?{' '}
        <Link href="/login" className="font-semibold text-blue-700 hover:underline">
          เข้าสู่ระบบ
        </Link>
      </p>
    </AuthCard>
  );
}
