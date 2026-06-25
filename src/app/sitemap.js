import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

export default async function sitemap() {
  const pool = await getPool();
  
  // Default static routes
  const routes = [
    {
      url: 'https://Al Rehab.com',
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  try {
    // Fetch active products
    const [products] = await pool.query('SELECT id, title, updated_at, created_at FROM products WHERE is_active = 1');
    
    products.forEach((product) => {
      const slug = product.title ? encodeURIComponent(product.title.replace(/\\s+/g, '-')) : 'item';
      routes.push({
        url: `https://Al Rehab.com/product/${slug}`,
        lastModified: product.updated_at || product.created_at || new Date(),
        changeFrequency: 'weekly',
        priority: 0.8,
      });
    });

    // Fetch active categories
    const [categories] = await pool.query('SELECT name, updated_at FROM categories');
    categories.forEach((cat) => {
      // Assuming categories might have a specific landing page in the future, 
      // but for now, they are filtered on the homepage. 
      // If there are category routes, add them here.
    });

  } catch (error) {
    console.error('Error generating sitemap:', error);
  }

  return routes;
}
