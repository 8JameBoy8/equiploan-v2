// ตั้งค่า Next.js
// rewrites: เบราว์เซอร์เรียก /api/... ที่โดเมนเดียวกับหน้าเว็บ แล้ว Next.js ส่งต่อไปที่ backend
// จึงไม่ต้องเรียกข้ามโดเมน และ cookie ใช้ได้ตามปกติ
const backendUrl = process.env.BACKEND_URL || 'http://localhost:4000';

const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
