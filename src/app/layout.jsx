import { LanguageProvider } from '../contexts/LanguageContext';
import TrackingEngine from '../components/TrackingEngine';
import './globals.css';
import '../joo/jooMove.css';

export const viewport = { width: 'device-width', initialScale: 1, maximumScale: 5, viewportFit: 'cover' };

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://joomove.com'),
  title: { template: '%s | Joo Move', default: 'Joo Move | نقل وتغليف الأثاث باحتراف' },
  description: 'نقل وتغليف وفك وتركيب الأثاث للمنازل والمكاتب بفريق مدرب وعربيات مجهزة وخدمة متابعة واضحة.',
  keywords: ['Joo Move', 'نقل أثاث', 'تغليف أثاث', 'نقل عفش', 'فك وتركيب أثاث', 'نقل مكاتب'],
  authors: [{ name: 'Joo Move' }], creator: 'Joo Move', publisher: 'Joo Move',
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-video-preview': -1, 'max-image-preview': 'large', 'max-snippet': -1 } },
  openGraph: {
    type: 'website', locale: 'ar_EG', url: '/', siteName: 'Joo Move',
    title: 'Joo Move | نقل وتغليف الأثاث',
    description: 'ننقل عفشك كأنه بتاعنا — نقل وتغليف وفك وتركيب للمنازل والمكاتب.',
    images: [{ url: '/joo-logo.png', width: 1200, height: 630, alt: 'Joo Move' }],
  },
  twitter: { card: 'summary_large_image', title: 'Joo Move | نقل وتغليف الأثاث', description: 'خدمة نقل وتغليف وفك وتركيب احترافية للمنازل والمكاتب.', images: ['/joo-logo.png'] },
  icons: { icon: '/joo-icon.png', shortcut: '/joo-icon.png', apple: '/joo-icon.png' },
};

export default function RootLayout({ children }) {
  return <html lang="ar" dir="rtl"><body><LanguageProvider><TrackingEngine><div style={{ overflowX: 'hidden', width: '100%', position: 'relative', maxWidth: '100%' }}>{children}</div></TrackingEngine></LanguageProvider></body></html>;
}
