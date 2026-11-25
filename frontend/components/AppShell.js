'use client';
// โครงหน้าหลังล็อกอิน: ตรวจว่าใครล็อกอินอยู่ แล้วแสดงเมนูตามบทบาท
//   member -> แถบเมนูด้านบน, admin -> เมนูด้านข้าง (บนมือถือกลายเป็นแถบด้านบน)
// หมายเหตุ: การตรวจที่นี่มีไว้เพื่อความสะดวกของผู้ใช้เท่านั้น
//           การกันสิทธิ์จริงอยู่ที่ backend (requireRole) ทุก endpoint
import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import ClubLogo from './ClubLogo';
import { ErrorState } from './States';
import { BoxIcon, HomeIcon, ListIcon, LockIcon, LogoutIcon, SendIcon, UserIcon } from './Icons';

// รายการเมนูของแต่ละบทบาท
const MENUS = {
  member: [
    { href: '/', label: 'หน้าหลัก', icon: HomeIcon },
    { href: '/equipment', label: 'อุปกรณ์', icon: BoxIcon },
    { href: '/borrow', label: 'ขอยืม', icon: SendIcon },
    { href: '/my-loans', label: 'คำขอของฉัน', icon: ListIcon },
  ],
  admin: [
    { href: '/admin', label: 'หน้าหลัก', icon: HomeIcon },
    { href: '/admin/equipment', label: 'จัดการอุปกรณ์', icon: BoxIcon },
    { href: '/admin/loans', label: 'จัดการคำขอ', icon: ListIcon },
  ],
};

export default function AppShell({ role, children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [state, setState] = useState('loading'); // loading | ok | forbidden | error

  const checkLogin = useCallback(async () => {
    setState('loading');
    let res;
    try {
      res = await api('/auth/me');
    } catch {
      setState('error'); // ติดต่อ backend ไม่ได้
      return;
    }
    if (res.status === 401) {
      router.replace('/login'); // ยังไม่ได้ล็อกอิน
      return;
    }
    if (!res.ok) {
      setState('error');
      return;
    }
    const me = res.data.user;
    if (me.role === role) {
      setUser(me);
      setState('ok');
    } else if (me.role === 'admin') {
      router.replace('/admin'); // admin เปิดหน้าของ member -> พาไปหน้าของ admin
    } else {
      setUser(me);
      setState('forbidden'); // member เปิดหน้าของ admin -> ไม่อนุญาต
    }
  }, [role, router]);

  useEffect(() => {
    checkLogin();
  }, [checkLogin]);

  async function logout() {
    await api('/auth/logout', { method: 'POST' });
    router.replace('/login');
  }

  if (state === 'loading') {
    return (
      <div role="status" aria-label="กำลังโหลด" className="flex min-h-screen flex-col items-center justify-center gap-4">
        <ClubLogo stacked />
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-700" />
      </div>
    );
  }

  if (state === 'error') {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full">
          <ErrorState message="เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง" onRetry={checkLogin} />
        </div>
      </main>
    );
  }

  if (state === 'forbidden') {
    return (
      <main className="mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="card w-full p-8 text-center">
          <div className="mx-auto mb-4 w-fit rounded-full bg-red-50 p-5 text-red-500">
            <LockIcon className="h-10 w-10" />
          </div>
          <h1 className="text-xl font-bold">ไม่มีสิทธิ์เข้าถึง</h1>
          <p className="mt-2 text-slate-500">หน้านี้สำหรับผู้ดูแลระบบเท่านั้น</p>
          <Link href="/" className="btn-primary mt-6">กลับหน้าหลัก</Link>
        </div>
      </main>
    );
  }

  return role === 'admin' ? (
    <AdminLayout user={user} onLogout={logout}>{children(user)}</AdminLayout>
  ) : (
    <MemberLayout user={user} onLogout={logout}>{children(user)}</MemberLayout>
  );
}

// เมนูนี้คือหน้าปัจจุบันไหม: ตรงกันพอดี หรือเป็นหน้าย่อย (เช่น /admin/equipment/new อยู่ใต้ /admin/equipment)
// ยกเว้นหน้าหลัก ('/' และ '/admin') ที่ต้องตรงกันพอดีเท่านั้น
function isActive(pathname, href) {
  if (href === '/' || href === '/admin') return pathname === href;
  return pathname === href || pathname.startsWith(href + '/');
}

// วงกลมไอคอนผู้ใช้ + ชื่อ
function UserBadge({ user }) {
  return (
    <span className="flex min-w-0 items-center gap-2 text-slate-700">
      <span className="shrink-0 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 p-1.5 text-white">
        <UserIcon className="h-4 w-4" />
      </span>
      <span className="truncate font-medium">{user.fullName}</span>
    </span>
  );
}

function LogoutButton({ onLogout, compact }) {
  return (
    <button
      onClick={onLogout}
      title="ออกจากระบบ"
      className="flex shrink-0 items-center gap-2 rounded-xl px-3 py-2 text-slate-600 transition hover:bg-red-50 hover:text-red-600"
    >
      <LogoutIcon />
      {/* compact: บนมือถือซ่อนข้อความ เหลือแต่ไอคอน */}
      <span className={compact ? 'hidden sm:inline' : ''}>ออกจากระบบ</span>
    </button>
  );
}

// member: แถบเมนูด้านบน
//   จอใหญ่: โลโก้ | เมนู | ผู้ใช้  — มือถือ: โลโก้+ผู้ใช้ แถวบน, เมนูเป็นช่องเท่ากัน (ไอคอนบน ข้อความล่าง) แถวล่าง
function MemberLayout({ user, onLogout, children }) {
  const pathname = usePathname();
  return (
    <div className="mx-auto max-w-6xl px-4 py-4">
      <header className="card flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3 sm:px-6 lg:flex-nowrap">
        <div className="order-1 shrink-0">
          <ClubLogo />
        </div>
        <nav className="order-3 grid w-full grid-cols-4 gap-1 sm:flex sm:justify-center lg:order-2 lg:w-auto lg:flex-1">
          {MENUS.member.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 whitespace-nowrap rounded-xl border-b-2 px-1 py-2 text-xs transition sm:flex-row sm:gap-2 sm:px-3 sm:text-base ${
                  active
                    ? 'border-blue-700 bg-blue-50 font-semibold text-blue-700'
                    : 'border-transparent text-slate-600 hover:bg-blue-50/60 hover:text-blue-700'
                }`}
              >
                <Icon /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="order-2 ml-auto flex min-w-0 items-center gap-1 lg:order-3 lg:ml-0">
          <UserBadge user={user} />
          <LogoutButton onLogout={onLogout} compact />
        </div>
      </header>
      <main className="mt-6">{children}</main>
    </div>
  );
}

// admin: เมนูด้านข้าง (มือถือ: แถบบน + เมนูเป็นช่องเท่ากัน)
function AdminLayout({ user, onLogout, children }) {
  const pathname = usePathname();
  return (
    <div className="flex min-h-screen flex-col gap-4 p-4 md:flex-row md:gap-6">
      <aside className="card flex flex-col gap-3 p-4 md:sticky md:top-4 md:h-[calc(100vh-2rem)] md:w-64 md:shrink-0 md:gap-8 md:p-6">
        {/* แถวบน (มือถือ): โลโก้ + ผู้ใช้ + ปุ่มออก */}
        <div className="flex items-center justify-between gap-3 md:justify-center">
          <div className="hidden md:block"><ClubLogo stacked /></div>
          <div className="md:hidden"><ClubLogo /></div>
          <div className="md:hidden"><LogoutButton onLogout={onLogout} compact /></div>
        </div>
        <nav className="grid grid-cols-3 gap-1 md:flex md:flex-col">
          {MENUS.admin.map((item) => {
            const Icon = item.icon;
            const active = isActive(pathname, item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`flex flex-col items-center gap-1 whitespace-nowrap rounded-xl px-1 py-2 text-xs transition md:flex-row md:gap-3 md:px-4 md:py-2.5 md:text-base ${
                  active
                    ? 'bg-blue-600 font-semibold text-white shadow-md shadow-blue-600/30'
                    : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                <Icon /> {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="mt-auto hidden md:block">
          <LogoutButton onLogout={onLogout} />
        </div>
      </aside>
      <div className="min-w-0 flex-1">
        <header className="mb-4 flex justify-end">
          <div className="card flex items-center px-4 py-2">
            <UserBadge user={user} />
          </div>
        </header>
        <main>{children}</main>
      </div>
    </div>
  );
}
