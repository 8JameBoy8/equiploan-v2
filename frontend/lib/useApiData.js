'use client';
// hook โหลดข้อมูลจาก BE แบบ GET พร้อมสถานะ loading / error และฟังก์ชันโหลดใหม่ (reload)
//   const { data, error, loading, reload } = useApiData('/equipment');
import { useCallback, useEffect, useState } from 'react';
import { api } from './api';

export function useApiData(path) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api(path);
      if (res.ok) setData(res.data);
      else setError(res.data?.error || 'โหลดข้อมูลไม่สำเร็จ');
    } catch {
      // fetch ล้มเหลว เช่น backend ปิดอยู่หรือเน็ตหลุด
      setError('เชื่อมต่อเซิร์ฟเวอร์ไม่ได้ กรุณาลองใหม่อีกครั้ง');
    }
    setLoading(false);
  }, [path]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { data, error, loading, reload };
}
