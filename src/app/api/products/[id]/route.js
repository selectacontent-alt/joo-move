import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';

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

export async function PUT(request, { params }) {
  try {
    const { id } = await params;
    const { title, price, image, category, categories, description, options, images, is_offer, is_active, old_price, stock, badge, description_image, description_images, sort_order } = await request.json();
    const productCategories = normalizeCategories({ categories, category });
    const primaryCategory = productCategories[0] || category;
    const optionsJson = options ? (typeof options === 'string' ? options : JSON.stringify(options)) : null;
    const imagesJson = images ? (typeof images === 'string' ? images : JSON.stringify(images)) : null;
    const categoriesJson = productCategories.length ? JSON.stringify(productCategories) : null;
    const descImagesJson = description_images ? (typeof description_images === 'string' ? description_images : JSON.stringify(description_images)) : null;
    const offerVal = is_offer ? 1 : 0;
    const activeVal = is_active !== undefined ? (is_active ? 1 : 0) : 1;
    const oldPriceVal = old_price ? Number(old_price) : null;
    const stockVal = stock !== undefined ? Number(stock) : 100;
    const sortOrderVal = sort_order !== undefined && sort_order !== null ? parseInt(sort_order, 10) || 0 : 0;
    
    const pool = await getPool();

    let warningMsg = null;

    if (sortOrderVal > 0) {
      const [existing] = await pool.query('SELECT id, sort_order FROM products WHERE sort_order = ? AND id != ?', [sortOrderVal, id]);
      if (existing.length > 0) {
        const conflictId = existing[0].id;
        const [currentProd] = await pool.query('SELECT sort_order FROM products WHERE id = ?', [id]);
        const currentSortOrder = currentProd.length > 0 ? (currentProd[0].sort_order || 0) : 0;
        
        await pool.query('UPDATE products SET sort_order = ? WHERE id = ?', [currentSortOrder, conflictId]);
        warningMsg = `تم استبدال ترتيب المنتج مع منتج آخر كان يحمل نفس الرقم (${sortOrderVal})`;
      }
    }

    await pool.query(
      'UPDATE products SET title = ?, price = ?, image = ?, category = ?, categories = ?, description = ?, options = ?, images = ?, is_offer = ?, is_active = ?, old_price = ?, stock = ?, badge = ?, description_image = ?, description_images = ?, sort_order = ? WHERE id = ?',
      [title, price, image, primaryCategory, categoriesJson, description || null, optionsJson, imagesJson, offerVal, activeVal, oldPriceVal, stockVal, badge || null, description_image || null, descImagesJson || null, sortOrderVal, id]
    );
    return NextResponse.json({ message: 'Product updated successfully', warning: warningMsg });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    const pool = await getPool();
    await pool.query('DELETE FROM product_translations WHERE product_id = ?', [id]);
    await pool.query('DELETE FROM products WHERE id = ?', [id]);
    return NextResponse.json({ message: 'Product deleted' });
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
