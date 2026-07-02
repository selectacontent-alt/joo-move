export default function robots() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://joomove.com';
  return { rules: { userAgent: '*', allow: '/', disallow: ['/api/', '/scpanel/'] }, sitemap: `${base}/sitemap.xml` };
}
