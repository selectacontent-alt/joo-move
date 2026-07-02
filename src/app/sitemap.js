import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const base = process.env.NEXT_PUBLIC_SITE_URL || 'https://joomove.com';
  const now = new Date();
  const paths = ['', '/services', '/request-move', '/our-work', '/about', '/track-request', '/contact', '/service-policy'];
  const routes = paths.map((path, index) => ({ url: `${base}${path}`, lastModified: now, changeFrequency: index < 2 ? 'weekly' : 'monthly', priority: index === 0 ? 1 : .8 }));
  try {
    const pool = await getPool();
    const [services] = await pool.query('SELECT slug, updated_at FROM services WHERE is_active = 1 ORDER BY sort_order');
    services.forEach((service) => routes.push({ url: `${base}/services/${service.slug}`, lastModified: service.updated_at || now, changeFrequency: 'monthly', priority: .75 }));
  } catch {}
  return routes;
}
