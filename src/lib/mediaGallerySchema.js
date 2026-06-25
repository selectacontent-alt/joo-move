export async function ensureMediaHomepageColumn(pool) {
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS count
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'media_gallery'
       AND COLUMN_NAME = 'show_on_homepage'`
  );

  const exists = Number(rows?.[0]?.count || 0) > 0;
  if (!exists) {
    await pool.query(
      `ALTER TABLE media_gallery
       ADD COLUMN show_on_homepage TINYINT(1) NOT NULL DEFAULT 0`
    );
  }
}
