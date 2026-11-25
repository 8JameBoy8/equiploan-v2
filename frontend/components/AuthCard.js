// โครงหน้าล็อกอิน/สมัคร: แถบหัวด้านบน + การ์ดสีขาวกลางจอ
import ClubLogo from './ClubLogo';

export default function AuthCard({ icon, title, subtitle, children }) {
  return (
    <div className="flex min-h-screen flex-col px-4 py-4 sm:px-6">
      {/* แถบหัว: แสดงชื่อชมรมเท่านั้น */}
      <header className="card mx-auto flex w-full max-w-5xl items-center px-5 py-3 sm:px-8 sm:py-4">
        <ClubLogo />
      </header>

      <main className="flex flex-1 items-center justify-center py-10">
        <div className="card w-full max-w-md p-6 sm:p-9">
          <div className="mb-7 flex flex-col items-center text-center">
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-4 text-white shadow-lg shadow-blue-700/30">
              {icon}
            </div>
            <h1 className="text-2xl font-bold text-slate-800 sm:text-3xl">{title}</h1>
            <p className="mt-1 text-slate-500">{subtitle}</p>
          </div>
          {children}
        </div>
      </main>
    </div>
  );
}

// ช่องกรอกพร้อมไอคอนด้านหน้า
export function IconInput({ icon, ...inputProps }) {
  return (
    <label className="flex items-center gap-3 rounded-xl border border-slate-300 bg-white px-4 py-3 transition focus-within:border-blue-600 focus-within:ring-2 focus-within:ring-blue-100">
      <span className="text-slate-400">{icon}</span>
      <input className="w-full min-w-0 bg-transparent outline-none placeholder:text-slate-400" {...inputProps} />
    </label>
  );
}

// ใช้ ErrorBox ตัวเดียวกับฟอร์มอื่น (ส่งออกซ้ำเพื่อให้หน้าที่ import จากไฟล์นี้ยังใช้ได้)
export { ErrorBox } from './FormParts';
