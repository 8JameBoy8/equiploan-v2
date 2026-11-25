// แสดงวันเวลาแบบไทย เช่น "16 พ.ย. 2569 19:30"
export function formatDateTime(value) {
  if (!value) return '-';
  return new Date(value).toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' });
}
