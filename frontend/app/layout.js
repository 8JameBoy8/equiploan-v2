// โครงหลักของทุกหน้า: ภาษา, ฟอนต์, CSS
import { Noto_Sans_Thai } from 'next/font/google';
import { CLUB_NAME } from '@/lib/config';
import './globals.css';

const notoThai = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-thai',
});

export const metadata = {
  title: `ระบบยืม-คืนอุปกรณ์ | ${CLUB_NAME}`,
};

export default function RootLayout({ children }) {
  return (
    <html lang="th" className={notoThai.variable}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
