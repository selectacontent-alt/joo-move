import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

const ALLOWED_PATHS = new Set([
  '/', '/store', '/booking', '/media', '/about', '/track', '/contact',
  '/policy', '/login', '/account', '/checkout',
]);

const FALLBACKS = {
  '/': ['/store', '/booking', '/media'],
  '/store': ['/checkout', '/booking', '/'],
  '/booking': ['/store', '/contact', '/'],
  '/media': ['/booking', '/store', '/'],
  '/about': ['/store', '/contact', '/'],
  '/track': ['/store', '/contact', '/'],
  '/contact': ['/store', '/', '/about'],
  '/policy': ['/store', '/checkout', '/'],
  '/login': ['/account', '/store', '/'],
  '/account': ['/store', '/track', '/'],
  '/checkout': ['/store', '/track', '/'],
};

const resourcesFor = (path, language) => {
  const lang = language === 'en' ? 'en' : 'ar';
  const resources = {
    '/': ['/api/settings', `/api/products?lang=${lang}`, `/api/categories?lang=${lang}`, '/api/media/homepage', '/api/testimonials'],
    '/store': [`/api/products?lang=${lang}`, `/api/categories?lang=${lang}`],
    '/booking': ['/api/booking'],
    '/media': ['/api/media'],
  };
  return resources[path] || [];
};

let tableReady;
const ensureTable = pool => {
  if (!tableReady) {
    tableReady = pool.query(`
      CREATE TABLE IF NOT EXISTS navigation_predictions (
        from_path VARCHAR(120) NOT NULL,
        to_path VARCHAR(120) NOT NULL,
        visits INT NOT NULL DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (from_path, to_path),
        INDEX idx_navigation_from_visits (from_path, visits)
      )
    `).catch(error => {
      tableReady = null;
      throw error;
    });
  }
  return tableReady;
};

const normalizePath = value => {
  const clean = String(value || '/').split('?')[0].replace(/\/+$/, '');
  return clean || '/';
};

export async function GET(request) {
  const from = normalizePath(new URL(request.url).searchParams.get('from'));
  const language = new URL(request.url).searchParams.get('lang');
  const fallback = FALLBACKS[from] || FALLBACKS['/'];

  try {
    const pool = await getPool();
    await ensureTable(pool);
    const [rows] = await pool.query(
      'SELECT to_path, visits FROM navigation_predictions WHERE from_path = ? ORDER BY visits DESC, updated_at DESC LIMIT 3',
      [from]
    );

    const learned = rows.map(row => row.to_path).filter(path => ALLOWED_PATHS.has(path));
    const paths = [...new Set([...learned, ...fallback])].filter(path => path !== from).slice(0, 3);
    const maxVisits = Math.max(1, ...rows.map(row => Number(row.visits) || 0));

    return NextResponse.json({
      from,
      predictions: paths.map((path, index) => {
        const learnedRow = rows.find(row => row.to_path === path);
        return {
          path,
          score: learnedRow ? Number((Number(learnedRow.visits) / maxVisits).toFixed(3)) : Number((0.35 - index * 0.08).toFixed(2)),
          resources: resourcesFor(path, language),
        };
      }),
    }, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch {
    return NextResponse.json({
      from,
      predictions: fallback.slice(0, 3).map((path, index) => ({
        path,
        score: Number((0.35 - index * 0.08).toFixed(2)),
        resources: resourcesFor(path, language),
      })),
    });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const from = normalizePath(body.from);
    const to = normalizePath(body.to);
    if (!ALLOWED_PATHS.has(from) || !ALLOWED_PATHS.has(to) || from === to) {
      return NextResponse.json({ recorded: false });
    }

    const pool = await getPool();
    await ensureTable(pool);
    await pool.query(
      `INSERT INTO navigation_predictions (from_path, to_path, visits)
       VALUES (?, ?, 1)
       ON DUPLICATE KEY UPDATE visits = visits + 1, updated_at = CURRENT_TIMESTAMP`,
      [from, to]
    );
    return NextResponse.json({ recorded: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
