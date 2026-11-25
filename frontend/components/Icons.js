// ไอคอนเส้นเรียบง่าย (SVG) ใช้ร่วมกันทุกหน้า — สีตามสีตัวอักษรของตัวแม่ (currentColor)
function Icon({ children, className = 'h-5 w-5' }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export const HomeIcon = (p) => (
  <Icon {...p}><path d="M3 11l9-8 9 8" /><path d="M5 10v10h14V10" /></Icon>
);
export const BoxIcon = (p) => (
  <Icon {...p}><path d="M21 8l-9-5-9 5 9 5 9-5z" /><path d="M3 8v8l9 5 9-5V8" /><path d="M12 13v8" /></Icon>
);
export const ListIcon = (p) => (
  <Icon {...p}><path d="M8 6h13M8 12h13M8 18h13" /><path d="M3 6h.01M3 12h.01M3 18h.01" /></Icon>
);
export const LogoutIcon = (p) => (
  <Icon {...p}><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" /><path d="M16 17l5-5-5-5" /><path d="M21 12H9" /></Icon>
);
export const LockIcon = (p) => (
  <Icon {...p}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 018 0v4" /></Icon>
);
export const UserIcon = (p) => (
  <Icon {...p}><circle cx="12" cy="8" r="4" /><path d="M4 21a8 8 0 0116 0" /></Icon>
);
export const MailIcon = (p) => (
  <Icon {...p}><rect x="3" y="5" width="18" height="14" rx="2" /><path d="M3 7l9 6 9-6" /></Icon>
);
export const UsersIcon = (p) => (
  <Icon {...p}><circle cx="9" cy="8" r="3.5" /><path d="M2.5 20a6.5 6.5 0 0113 0" /><circle cx="17" cy="9" r="2.5" /><path d="M16 14.5a5 5 0 015.5 5.5" /></Icon>
);
export const SendIcon = (p) => (
  <Icon {...p}><path d="M22 2L11 13" /><path d="M22 2l-7 20-4-9-9-4 20-7z" /></Icon>
);
export const CheckIcon = (p) => (
  <Icon {...p}><path d="M20 6L9 17l-5-5" /></Icon>
);
export const XIcon = (p) => (
  <Icon {...p}><path d="M18 6L6 18M6 6l12 12" /></Icon>
);
export const CameraIcon = (p) => (
  <Icon {...p}><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" /><circle cx="12" cy="13" r="4" /></Icon>
);
export const ReturnIcon = (p) => (
  <Icon {...p}><path d="M9 14L4 9l5-5" /><path d="M4 9h11a5 5 0 010 10h-3" /></Icon>
);
export const AlertIcon = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 8v4M12 16h.01" /></Icon>
);
export const InfoIcon = (p) => (
  <Icon {...p}><circle cx="12" cy="12" r="9" /><path d="M12 11v5M12 8h.01" /></Icon>
);
export const ChevronRightIcon = (p) => (
  <Icon {...p}><path d="M9 18l6-6-6-6" /></Icon>
);
export const PlusIcon = (p) => (
  <Icon {...p}><path d="M12 5v14M5 12h14" /></Icon>
);
export const EditIcon = (p) => (
  <Icon {...p}><path d="M12 20h9" /><path d="M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4 12.5-12.5z" /></Icon>
);
export const LoginIcon = (p) => (
  <Icon {...p}><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" /><path d="M10 17l5-5-5-5" /><path d="M15 12H3" /></Icon>
);
export const ClipboardIcon = (p) => (
  <Icon {...p}><rect x="5" y="4" width="14" height="17" rx="2" /><path d="M9 4V3h6v1" /><path d="M9 11h6M9 15h4" /></Icon>
);
export const TrashIcon = (p) => (
  <Icon {...p}><path d="M3 6h18" /><path d="M8 6V4h8v2" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" /></Icon>
);
