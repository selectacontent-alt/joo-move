import App from '../../App';

export default function Page() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://joomove.com';
  const structuredData = { '@context': 'https://schema.org', '@type': 'MovingCompany', name: 'Joo Move', url: base, logo: `${base}/joo-logo.png`, description: 'نقل وتغليف وفك وتركيب الأثاث للمنازل والمكاتب.', areaServed: 'Egypt' };
  return <><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} /><App /></>;
}
