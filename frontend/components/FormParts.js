// ชิ้นส่วนฟอร์มที่ใช้ร่วมกัน
import { InfoIcon } from './Icons';

// หัวข้อส่วนของฟอร์ม เช่น "ข้อมูลการยืม" พร้อมไอคอน
export function SectionTitle({ icon, children }) {
  return (
    <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-slate-800">
      <span className="text-blue-700">{icon}</span>
      {children}
    </h2>
  );
}

// หนึ่งแถวของฟอร์ม: จอใหญ่ชื่อช่องอยู่ซ้าย / มือถือชื่อช่องอยู่บน
//   htmlFor: id ของช่องกรอก (ให้กดที่ชื่อช่องแล้วไปที่ช่องได้)
export function FormRow({ label, required, htmlFor, children, hint }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-[180px_1fr] sm:items-start sm:gap-4">
      <label htmlFor={htmlFor} className="label sm:pt-2.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className="min-w-0">
        {children}
        {hint && <div className="mt-1 text-sm text-slate-400">{hint}</div>}
      </div>
    </div>
  );
}

// กล่องข้อความแนะนำสีฟ้าอ่อน
export function InfoNote({ children }) {
  return (
    <p className="flex items-start gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm text-blue-800">
      <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" />
      <span>{children}</span>
    </p>
  );
}

// กล่องแสดงข้อความ error สีแดง
export function ErrorBox({ message }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-xl bg-red-50 px-4 py-2.5 text-sm text-red-700 ring-1 ring-inset ring-red-200">
      {message}
    </p>
  );
}
