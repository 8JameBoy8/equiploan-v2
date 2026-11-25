'use client';
// หน้าเข้าสู่ระบบ
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import AuthCard, { IconInput, ErrorBox } from '@/components/AuthCard';
import { LockIcon, LoginIcon, MailIcon } from '@/components/Icons';
import { api } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    let res;
    try {
      res = await api('/auth/login', { method: 'POST', body: { email, password } });
    } catch {
      res = { ok: false, data: { error: 'เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่' } };
    }
    setLoading(false);

    if (!res.ok) {
      setError(res.data?.error || 'เข้าสู่ระบบไม่สำเร็จ');
      return;
    }
    // ไปหน้าหลักตามบทบาท
    router.replace(res.data.user.role === 'admin' ? '/admin' : '/');
  }

  return (
    <AuthCard icon={<LockIcon className="h-8 w-8" />} title="เข้าสู่ระบบ" subtitle="กรุณากรอกอีเมลและรหัสผ่าน">
      <form onSubmit={handleSubmit} className="space-y-4">
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
          placeholder="รหัสผ่าน"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <ErrorBox message={error} />
        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full py-3"
        >
          <LoginIcon /> {loading ? 'กำลังเข้าสู่ระบบ...' : 'เข้าสู่ระบบ'}
        </button>
      </form>

      <p className="mt-6 text-center text-slate-600">
        ยังไม่มีบัญชีใช่ไหม?{' '}
        <Link href="/register" className="font-semibold text-blue-700 hover:underline">
          สมัครสมาชิก
        </Link>
      </p>
    </AuthCard>
  );
}
