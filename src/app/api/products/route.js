import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

export const dynamic = 'force-dynamic';

const parseJsonArray = (value) => {
  if (!value) return [];
  try {
    const parsed = typeof value === 'string' ? JSON.parse(value) : value;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

const normalizeCategories = ({ categories, category }) => {
  const source = categories !== undefined && categories !== null && categories !== ''
    ? categories
    : category;
  let values = [];

  if (Array.isArray(source)) {
    values = source;
  } else if (typeof source === 'string') {
    const trimmed = source.trim();
    if (trimmed.startsWith('[')) {
      try {
        const parsed = JSON.parse(trimmed);
        values = Array.isArray(parsed) ? parsed : [trimmed];
      } catch {
        values = [trimmed];
      }
    } else {
      values = trimmed.split(',').map(item => item.trim());
    }
  }

  const seen = new Set();
  return values
    .map(value => String(value || '').trim())
    .filter(value => value && !seen.has(value) && seen.add(value));
};

const decorateProductCategories = (product, categoryTranslations = new Map()) => {
  const categories = normalizeCategories(product);
  const primaryCategory = categories[0] || product.category || '';

  return {
    ...product,
    category: primaryCategory,
    categories,
    category_name: categoryTranslations.get(primaryCategory) || primaryCategory,
    category_names: categories.map(item => categoryTranslations.get(item) || item)
  };
};

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const language = (searchParams.get('lang') || '').trim().slice(0, 10);
    const pool = await getPool();
    let query = 'SELECT * FROM products';
    if (!all) {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY IF(sort_order = 0, 999999, sort_order) ASC, id DESC';
    const [rows] = await pool.query(query);

    if (!language || language === 'ar') {
      return NextResponse.json(rows.map(row => decorateProductCategories(row)));
    }

    const [[productTranslationRows], [categoryTranslationRows]] = await Promise.all([
      pool.query(
        'SELECT product_id, title, description, badge, colors, sizes FROM product_translations WHERE language = ?',
        [language]
      ),
      pool.query(
        `SELECT categories.name AS source_name, category_translations.name AS translated_name
         FROM categories
         INNER JOIN category_translations ON category_translations.category_id = categories.id
         WHERE category_translations.language = ?`,
        [language]
      )
    ]);

    const productTranslations = new Map(
      productTranslationRows.map(row => [Number(row.product_id), row])
    );
    const categoryTranslations = new Map(
      categoryTranslationRows.map(row => [row.source_name, row.translated_name])
    );

    const localizedRows = rows.map(product => {
      const translation = productTranslations.get(Number(product.id)) || {};
      return {
        ...decorateProductCategories(product, categoryTranslations),
        title: translation.title || product.title,
        description: translation.description || product.description,
        badge: translation.badge || product.badge,
        option_labels: {
          colors: parseJsonArray(translation.colors),
          sizes: parseJsonArray(translation.sizes)
        }
      };
    });

    return NextResponse.json(localizedRows);
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { title, price, image, category, categories, description, options, images, is_offer, old_price, stock, badge, description_image, description_images, is_active, sort_order } = await request.json();
    const productCategories = normalizeCategories({ categories, category });
    const primaryCategory = productCategories[0] || category;
    const optionsJson = options ? (typeof options === 'string' ? options : JSON.stringify(options)) : null;
    const imagesJson = images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;
    const descImagesJson = description_images ? (typeof description_images === 'string' ? description_images : JSON.stringify(description_images)) : null;
    const categoriesJson = productCategories.length ? JSON.stringify(productCategories) : null;
    const offerVal = is_offer ? 1 : 0;
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : 1;
    const oldPriceVal = old_price ? Number(old_price) : null;
    const stockVal = stock !== undefined ? Number(stock) : 100;
    const sortOrderVal = sort_order !== undefined && sort_order !== null ? parseInt(sort_order, 10) || 0 : 0;
    
    const pool = await getPool();
    const [result] = await pool.query(
      'INSERT INTO products (title, price, image, category, categories, description, options, images, is_offer, is_active, old_price, stock, badge, description_image, description_images, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [title, price, image, primaryCategory, categoriesJson, description || null, optionsJson, imagesJson, offerVal, activeVal, oldPriceVal, stockVal, badge || null, description_image || null, descImagesJson || null, sortOrderVal]
    );
    
    return NextResponse.json({ 
      id: result.insertId, 
      title, 
      price, 
      image, 
      category: primaryCategory,
      categories: productCategories,
      description, 
      options, 
      images, 
      is_offer: offerVal, 
      is_active: activeVal,
      old_price: oldPriceVal, 
      stock: stockVal,
      badge: badge || null,
      description_image: description_image || null,
      description_images: description_images || null,
      sort_order: sortOrderVal
    }, { status: 201 });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
