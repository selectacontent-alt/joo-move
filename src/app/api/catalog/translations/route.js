import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

const TARGET_LANGUAGE = 'en';

const parseJsonArray = (value) => {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const parseProductOptions = (value) => {
  if (!value) return { colors: [], sizes: [] };
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    if (Array.isArray(parsed)) {
      return {
        colors: [],
        sizes: parsed.map(option => option?.name).filter(Boolean)
      };
    }
    return {
      colors: Array.isArray(parsed?.colors) ? parsed.colors : [],
      sizes: Array.isArray(parsed?.sizes) ? parsed.sizes : []
    };
  } catch {
    return { colors: [], sizes: [] };
  }
};

const cleanText = (value) => (
  typeof value === 'string' && value.trim() ? value.trim() : null
);

const normalizeTextArray = (value) => (
  Array.isArray(value)
    ? value.map(entry => (typeof entry === 'string' ? entry.trim() : ''))
    : []
);

const alignTextArray = (value, length) => {
  const parsed = parseJsonArray(value);
  return Array.from({ length }, (_, index) => (
    typeof parsed[index] === 'string' ? parsed[index] : ''
  ));
};

export async function GET() {
  try {
    const pool = await getPool();
    const [
      [products],
      [categories],
      [productTranslationRows],
      [categoryTranslationRows]
    ] = await Promise.all([
      pool.query('SELECT id, title, description, badge, category, options, image, images FROM products ORDER BY id DESC'),
      pool.query('SELECT id, name FROM categories ORDER BY id DESC'),
      pool.query('SELECT product_id, title, description, badge, colors, sizes FROM product_translations WHERE language = ?', [TARGET_LANGUAGE]),
      pool.query('SELECT category_id, name FROM category_translations WHERE language = ?', [TARGET_LANGUAGE])
    ]);

    const productTranslations = new Map(
      productTranslationRows.map(row => [Number(row.product_id), row])
    );
    const categoryTranslations = new Map(
      categoryTranslationRows.map(row => [Number(row.category_id), row])
    );

    return NextResponse.json({
      language: TARGET_LANGUAGE,
      products: products.map(product => {
        const options = parseProductOptions(product.options);
        const translation = productTranslations.get(Number(product.id)) || {};
        return {
          ...product,
          colors: options.colors,
          sizes: options.sizes,
          translation: {
            title: translation.title || '',
            description: translation.description || '',
            badge: translation.badge || '',
            colors: alignTextArray(translation.colors, options.colors.length),
            sizes: alignTextArray(translation.sizes, options.sizes.length)
          }
        };
      }),
      categories: categories.map(category => ({
        ...category,
        translation: {
          name: categoryTranslations.get(Number(category.id))?.name || ''
        }
      }))
    });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  let connection;

  try {
    const pool = await getPool();
    connection = await pool.getConnection();
    const body = await request.json();
    const productEntries = Array.isArray(body.productTranslations) ? body.productTranslations : [];
    const categoryEntries = Array.isArray(body.categoryTranslations) ? body.categoryTranslations : [];

    await connection.beginTransaction();

    for (const entry of categoryEntries) {
      const categoryId = Number(entry.categoryId);
      if (!Number.isInteger(categoryId) || categoryId <= 0) continue;

      const name = cleanText(entry.name);
      if (!name) {
        await connection.query(
          'DELETE FROM category_translations WHERE category_id = ? AND language = ?',
          [categoryId, TARGET_LANGUAGE]
        );
        continue;
      }

      await connection.query(
        `INSERT INTO category_translations (category_id, language, name)
         VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE name = VALUES(name)`,
        [categoryId, TARGET_LANGUAGE, name]
      );
    }

    for (const entry of productEntries) {
      const productId = Number(entry.productId);
      if (!Number.isInteger(productId) || productId <= 0) continue;

      const title = cleanText(entry.title);
      const description = cleanText(entry.description);
      const badge = cleanText(entry.badge);
      const colors = normalizeTextArray(entry.colors);
      const sizes = normalizeTextArray(entry.sizes);
      const hasOptionTranslations = colors.some(Boolean) || sizes.some(Boolean);

      if (!title && !description && !badge && !hasOptionTranslations) {
        await connection.query(
          'DELETE FROM product_translations WHERE product_id = ? AND language = ?',
          [productId, TARGET_LANGUAGE]
        );
        continue;
      }

      await connection.query(
        `INSERT INTO product_translations
          (product_id, language, title, description, badge, colors, sizes)
         VALUES (?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE
          title = VALUES(title),
          description = VALUES(description),
          badge = VALUES(badge),
          colors = VALUES(colors),
          sizes = VALUES(sizes)`,
        [
          productId,
          TARGET_LANGUAGE,
          title,
          description,
          badge,
          colors.length ? JSON.stringify(colors) : null,
          sizes.length ? JSON.stringify(sizes) : null
        ]
      );
    }

    await connection.commit();
    return NextResponse.json({ message: 'Catalog translations updated successfully' });
  } catch (err) {
    if (connection) await connection.rollback();
    return NextResponse.json({ error: err.message }, { status: 500 });
  } finally {
    connection?.release();
  }
}
