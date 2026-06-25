import { LanguageProvider } from '../contexts/LanguageContext';
import TrackingEngine from '../components/TrackingEngine';
import './globals.css';
import './agri_styles.css';
import './product_styles.css';
import './navbar_footer_styles.css';
import './booking_styles.css';

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
};

export const metadata = {
  metadataBase: new URL('https://alrehab-agri.com'),
  title: {
    template: '%s | شركة الرحاب',
    default: 'شركة الرحاب | للاستصلاح الزراعي والأعلاف الخضراء',
  },
  description: 'شركة الرحاب متخصصة في الاستصلاح الزراعي، زراعة وتوريد المحاصيل العلفية، الأعلاف الخضراء، السيلاج، وخدمة المزارع ومربي الماشية بأعلى جودة.',
  keywords: ['الرحاب', 'استصلاح زراعي', 'أعلاف خضراء', 'سيلاج', 'برسيم حجازي', 'توريد مزارع', 'محاصيل علفية', 'زراعة'],
  authors: [{ name: 'Al Rehab' }],
  creator: 'Al Rehab',
  publisher: 'Al Rehab',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'ar_EG',
    url: 'https://alrehab-agri.com',
    siteName: 'شركة الرحاب الزراعية',
    title: 'شركة الرحاب | للاستصلاح الزراعي والأعلاف',
    description: 'توريد علف أخضر، سيلاج، ومحاصيل علفية بجودة عالية لمزارع الإنتاج الحيواني، من الأرض لمزرعتك.',
    images: [
      {
        url: 'https://alrehab-agri.com/logo.png',
        secureUrl: 'https://alrehab-agri.com/logo.png',
        width: 800,
        height: 600,
        alt: 'Al Rehab Logo',
        type: 'image/png',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'شركة الرحاب الزراعية',
    description: 'توريد علف أخضر، سيلاج، ومحاصيل علفية بجودة عالية.',
    images: ['https://alrehab-agri.com/logo.png'],
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png'
  }
};

export default function RootLayout({ children }) {
  return (
    <html lang="ar" dir="rtl">
      <body>
        <LanguageProvider>
          <TrackingEngine>
            <div style={{ overflowX: 'hidden', width: '100%', position: 'relative', maxWidth: '100%' }}>
              {children}
            </div>
          </TrackingEngine>
        </LanguageProvider>
      </body>
    </html>
  );
}