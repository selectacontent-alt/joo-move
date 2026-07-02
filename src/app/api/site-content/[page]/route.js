import { NextResponse } from 'next/server';
import { getPool } from '@/lib/db';
import { getAdminSession } from '@/lib/adminSession';
import { DEFAULT_PAGE_CONTENT } from '@/joo/defaultContent';

const parseJson = (value, fallback = {}) => { try { return typeof value === 'string' ? JSON.parse(value) : (value ?? fallback); } catch { return fallback; } };

export async function GET(_request, { params }) {
  try {
    const { page: slug } = await params;
    const pool = await getPool();
    const [[page]] = await pool.query('SELECT * FROM site_pages WHERE slug = ? AND is_published = 1', [slug]);
    if (!page) {
      const fallback = DEFAULT_PAGE_CONTENT[slug];
      return fallback ? NextResponse.json(fallback) : NextResponse.json({ error: 'Page not found' }, { status: 404 });
    }
    const [sections] = await pool.query('SELECT * FROM page_sections WHERE page_id = ? ORDER BY sort_order ASC, id ASC', [page.id]);
    return NextResponse.json({
      seo: {
        title_ar: page.seo_title_ar, title_en: page.seo_title_en,
        description_ar: page.seo_description_ar, description_en: page.seo_description_en,
        image: page.seo_image,
      },
      sections: sections.map((section) => ({
        id: section.id, key: section.section_key, type: section.section_type,
        content_ar: parseJson(section.content_ar), content_en: parseJson(section.content_en),
        media: parseJson(section.media_json, []), settings: parseJson(section.settings_json),
        is_visible: Boolean(section.is_visible), sort_order: section.sort_order,
      })),
    });
  } catch (error) {
    const fallback = DEFAULT_PAGE_CONTENT[(await params).page];
    if (fallback) return NextResponse.json(fallback);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request, { params }) {
  if (!getAdminSession(request)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    const { page: slug } = await params;
    const data = await request.json();
    const pool = await getPool();
    const [result] = await pool.query(
      `INSERT INTO site_pages (slug, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en, seo_image, is_published)
       VALUES (?, ?, ?, ?, ?, ?, 1)
       ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id), seo_title_ar = VALUES(seo_title_ar), seo_title_en = VALUES(seo_title_en),
       seo_description_ar = VALUES(seo_description_ar), seo_description_en = VALUES(seo_description_en), seo_image = VALUES(seo_image)`,
      [slug, data.seo?.title_ar || '', data.seo?.title_en || '', data.seo?.description_ar || '', data.seo?.description_en || '', data.seo?.image || null]
    );
    const pageId = result.insertId;
    for (const section of data.sections || []) {
      await pool.query(
        `INSERT INTO page_sections (page_id, section_key, section_type, content_ar, content_en, media_json, settings_json, is_visible, sort_order)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE section_type = VALUES(section_type), content_ar = VALUES(content_ar), content_en = VALUES(content_en),
         media_json = VALUES(media_json), settings_json = VALUES(settings_json), is_visible = VALUES(is_visible), sort_order = VALUES(sort_order)`,
        [pageId, section.key, section.type, JSON.stringify(section.content_ar || {}), JSON.stringify(section.content_en || {}), JSON.stringify(section.media || []), JSON.stringify(section.settings || {}), section.is_visible ? 1 : 0, Number(section.sort_order || 0)]
      );
    }
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
