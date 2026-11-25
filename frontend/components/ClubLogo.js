// โลโก้ชมรม: ไอคอนกลุ่มคน + ชื่อชมรม (ชื่ออ่านจาก lib/config.js จุดเดียว)
import { CLUB_NAME } from '@/lib/config';
import { UsersIcon } from './Icons';

//   stacked = true: ไอคอนอยู่บน ชื่ออยู่ล่าง (ใช้ในเมนูด้านข้างของ admin)
export default function ClubLogo({ stacked = false }) {
  return (
    <div className={`flex items-center text-blue-700 ${stacked ? 'flex-col gap-1 text-center' : 'gap-2'}`}>
      <span className="rounded-xl bg-blue-50 p-1.5">
        <UsersIcon className={stacked ? 'h-9 w-9' : 'h-7 w-7'} />
      </span>
      <span className="whitespace-nowrap text-lg font-bold">{CLUB_NAME}</span>
    </div>
  );
}
