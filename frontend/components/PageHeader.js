// หัวข้อหน้าแบบการ์ดใหญ่: ไอคอนในวงกลมฟ้า + ชื่อหน้า + คำอธิบาย + ปุ่มด้านขวา (ถ้ามี)
export default function PageHeader({ icon, title, subtitle, action }) {
  return (
    <div className="card relative mb-6 flex flex-wrap items-center justify-between gap-4 overflow-hidden p-5 sm:p-7">
      {/* วงกลมตกแต่งจางๆ มุมขวา */}
      <div className="pointer-events-none absolute -right-10 -top-16 h-44 w-44 rounded-full bg-blue-100/50" aria-hidden="true" />
      <div className="relative flex min-w-0 items-center gap-4">
        <span className="shrink-0 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 p-3 text-white shadow-md shadow-blue-700/30 sm:p-4">
          {icon}
        </span>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-slate-800 sm:text-2xl">{title}</h1>
          {subtitle && <p className="text-sm text-slate-500 sm:text-base">{subtitle}</p>}
        </div>
      </div>
      {action && <div className="relative">{action}</div>}
    </div>
  );
}
