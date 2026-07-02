import mysql from 'mysql2/promise';
import { hashPassword } from './auth';
import {
  DEFAULT_BOOKING_CONFIRMATION_TEMPLATE,
  DEFAULT_ORDER_CONFIRMATION_TEMPLATE,
  LEGACY_ORDER_CONFIRMATION_TEMPLATE
} from './whatsappTemplates';
import { DEFAULT_SITE_SETTINGS } from './homeSettings';
import { ensureMediaHomepageColumn } from './mediaGallerySchema';
import {
  DEFAULT_AREAS,
  DEFAULT_FAQS,
  DEFAULT_PAGE_CONTENT,
  DEFAULT_SERVICES
} from '../joo/defaultContent';

let pool = global._mysqlPool;

function getRequiredEnv(name) {
  const value = process.env[name];
  if (value === undefined || value === '') {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getDbConfig(includeDatabase = true) {
  const config = {
    host: getRequiredEnv('DB_HOST'),
    user: getRequiredEnv('DB_USER'),
    password: process.env.DB_PASSWORD ?? '',
  };

  if (process.env.DB_PORT) {
    config.port = Number(process.env.DB_PORT);
  }

  if (includeDatabase) {
    config.database = getRequiredEnv('DB_NAME');
  }

  return config;
}

export async function getPool() {
  if (pool) return pool;
  if (global._mysqlPool) {
    pool = global._mysqlPool;
    return pool;
  }

  try {
    const dbName = getRequiredEnv('DB_NAME');
    const connection = await mysql.createConnection(getDbConfig(false));

    await connection.query('CREATE DATABASE IF NOT EXISTS ?? CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci', [dbName]);
    await connection.end();

    pool = mysql.createPool({
      ...getDbConfig(true),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
    global._mysqlPool = pool;

    // Create tables
    await pool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS products (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        price DECIMAL(10, 2) NOT NULL,
        old_price DECIMAL(10, 2) NULL,
        image VARCHAR(1000) NOT NULL,
        images JSON NULL,
        category VARCHAR(255) NOT NULL,
        categories JSON NULL,
        description TEXT NULL,
        options JSON NULL,
        sales INT DEFAULT 0,
        views INT DEFAULT 0,
        stock INT DEFAULT 100,
        is_offer TINYINT(1) DEFAULT 0,
        is_active TINYINT(1) DEFAULT 1,
        badge VARCHAR(255) NULL,
        description_image VARCHAR(1000) NULL,
        description_images JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS category_translations (
        category_id INT NOT NULL,
        language VARCHAR(10) NOT NULL,
        name VARCHAR(255) NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (category_id, language)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS product_translations (
        product_id INT NOT NULL,
        language VARCHAR(10) NOT NULL,
        title VARCHAR(255) NULL,
        description TEXT NULL,
        badge VARCHAR(255) NULL,
        colors JSON NULL,
        sizes JSON NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (product_id, language)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_number VARCHAR(100) NULL UNIQUE,
        customer_name VARCHAR(1000) NOT NULL,
        customer_id INT NULL,
        customer_phone VARCHAR(50) NULL,
        total DECIMAL(10, 2) NOT NULL,
        status VARCHAR(100) DEFAULT 'طلب جديد',
        coupon_code VARCHAR(255) NULL,
        products JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Migration updates for existing columns
    try {
      await pool.query('ALTER TABLE products ADD COLUMN sales INT DEFAULT 0');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN views INT DEFAULT 0');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN order_number VARCHAR(100) NULL UNIQUE');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN images JSON NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN categories JSON NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN is_offer TINYINT(1) DEFAULT 0');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN badge VARCHAR(255) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN description_image VARCHAR(1000) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN description_images JSON NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN old_price DECIMAL(10, 2) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN stock INT DEFAULT 100');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN is_active TINYINT(1) DEFAULT 1');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE products ADD COLUMN sort_order INT DEFAULT 0');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN products JSON NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN coupon_code VARCHAR(255) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN customer_phone VARCHAR(50) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN customer_id INT NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD INDEX idx_orders_customer_id_created_at (customer_id, created_at)');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD INDEX idx_orders_customer_phone_created_at (customer_phone, created_at)');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN shipping_provider VARCHAR(50) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN tracking_number VARCHAR(100) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN shipping_label_url VARCHAR(500) NULL');
    } catch (e) {}
    try {
      await pool.query("ALTER TABLE orders ADD COLUMN shipping_status VARCHAR(50) DEFAULT 'Pending'");
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders ADD COLUMN shipping_logs JSON NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE orders MODIFY customer_name VARCHAR(1000) NOT NULL');
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(255) PRIMARY KEY,
        setting_value TEXT NOT NULL
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS navigation_predictions (
        from_path VARCHAR(120) NOT NULL,
        to_path VARCHAR(120) NOT NULL,
        visits INT NOT NULL DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (from_path, to_path),
        INDEX idx_navigation_from_visits (from_path, visits)
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS testimonials (
        id INT AUTO_INCREMENT PRIMARY KEY,
        image_url VARCHAR(1000) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    for (const testimonialColumn of [
      'ADD COLUMN name_ar VARCHAR(255) NULL',
      'ADD COLUMN name_en VARCHAR(255) NULL',
      'ADD COLUMN text_ar TEXT NULL',
      'ADD COLUMN text_en TEXT NULL',
      'ADD COLUMN rating INT NOT NULL DEFAULT 5',
      'ADD COLUMN is_active TINYINT(1) NOT NULL DEFAULT 1',
      'ADD COLUMN sort_order INT NOT NULL DEFAULT 0'
    ]) {
      try { await pool.query(`ALTER TABLE testimonials ${testimonialColumn}`); } catch (e) {}
    }

    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NULL,
        description TEXT NULL,
        image_url VARCHAR(1000) NOT NULL,
        show_on_homepage TINYINT(1) NOT NULL DEFAULT 0,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    await ensureMediaHomepageColumn(pool);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(255) UNIQUE NOT NULL,
        type VARCHAR(50) NOT NULL,
        discount_value DECIMAL(10, 2) DEFAULT 0,
        usage_limit INT DEFAULT 0,
        used_count INT DEFAULT 0,
        expiry_date DATETIME NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role VARCHAR(50) DEFAULT 'admin',
        permissions JSON NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    try {
      await pool.query('ALTER TABLE users ADD COLUMN permissions JSON NULL');
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS customers (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        phone VARCHAR(50) NULL,
        alt_phone VARCHAR(50) NULL,
        governorate VARCHAR(255) NULL,
        city VARCHAR(255) NULL,
        address TEXT NULL,
        apartment VARCHAR(255) NULL,
        landmark VARCHAR(255) NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    try {
      await pool.query('ALTER TABLE customers ADD COLUMN alt_phone VARCHAR(50) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE customers ADD COLUMN governorate VARCHAR(255) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE customers ADD COLUMN city VARCHAR(255) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE customers ADD COLUMN address TEXT NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE customers ADD COLUMN apartment VARCHAR(255) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE customers ADD COLUMN landmark VARCHAR(255) NULL');
    } catch (e) {}
    try {
      await pool.query('ALTER TABLE customers ADD COLUMN updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP');
    } catch (e) {}

    await pool.query(`
      CREATE TABLE IF NOT EXISTS contact_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        email VARCHAR(150) NOT NULL,
        message TEXT NOT NULL,
        is_read TINYINT(1) DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Joo Move service platform. Legacy commerce tables stay available as a read-only archive.
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(160) NOT NULL UNIQUE,
        icon_key VARCHAR(80) NULL,
        category VARCHAR(80) NOT NULL DEFAULT 'home',
        cover_media VARCHAR(1000) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_translations (
        service_id INT NOT NULL,
        language VARCHAR(10) NOT NULL,
        title VARCHAR(255) NOT NULL,
        short_description TEXT NULL,
        body LONGTEXT NULL,
        bullets JSON NULL,
        seo_title VARCHAR(255) NULL,
        seo_description TEXT NULL,
        PRIMARY KEY (service_id, language),
        CONSTRAINT fk_service_translations_service
          FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_pages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        slug VARCHAR(160) NOT NULL UNIQUE,
        seo_title_ar VARCHAR(255) NULL,
        seo_title_en VARCHAR(255) NULL,
        seo_description_ar TEXT NULL,
        seo_description_en TEXT NULL,
        seo_image VARCHAR(1000) NULL,
        is_published TINYINT(1) NOT NULL DEFAULT 1,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS page_sections (
        id INT AUTO_INCREMENT PRIMARY KEY,
        page_id INT NOT NULL,
        section_key VARCHAR(120) NOT NULL,
        section_type VARCHAR(80) NOT NULL,
        content_ar JSON NULL,
        content_en JSON NULL,
        media_json JSON NULL,
        settings_json JSON NULL,
        is_visible TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        UNIQUE KEY uq_page_section (page_id, section_key),
        CONSTRAINT fk_page_sections_page
          FOREIGN KEY (page_id) REFERENCES site_pages(id) ON DELETE CASCADE
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS move_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        request_number VARCHAR(40) NULL UNIQUE,
        customer_name VARCHAR(255) NOT NULL,
        phone VARCHAR(50) NOT NULL,
        whatsapp VARCHAR(50) NULL,
        alternate_phone VARCHAR(50) NULL,
        move_type VARCHAR(80) NOT NULL DEFAULT 'home',
        origin_governorate VARCHAR(160) NULL,
        origin_area VARCHAR(255) NOT NULL,
        origin_address TEXT NULL,
        destination_governorate VARCHAR(160) NULL,
        destination_area VARCHAR(255) NOT NULL,
        destination_address TEXT NULL,
        origin_floor VARCHAR(50) NULL,
        destination_floor VARCHAR(50) NULL,
        origin_elevator TINYINT(1) NOT NULL DEFAULT 0,
        destination_elevator TINYINT(1) NOT NULL DEFAULT 0,
        stair_width VARCHAR(80) NULL,
        parking_distance VARCHAR(80) NULL,
        rooms INT NOT NULL DEFAULT 1,
        appliances JSON NULL,
        large_items TEXT NULL,
        services JSON NULL,
        preferred_date DATE NULL,
        preferred_period VARCHAR(60) NULL,
        flexible_date TINYINT(1) NOT NULL DEFAULT 0,
        notes TEXT NULL,
        source VARCHAR(80) NOT NULL DEFAULT 'website',
        status VARCHAR(60) NOT NULL DEFAULT 'received',
        assigned_employee VARCHAR(255) NULL,
        assigned_team VARCHAR(255) NULL,
        quoted_price DECIMAL(12,2) NULL,
        internal_notes TEXT NULL,
        customer_id INT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_move_status_date (status, preferred_date),
        INDEX idx_move_phone_created (phone, created_at)
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS move_request_media (
        id INT AUTO_INCREMENT PRIMARY KEY,
        move_request_id INT NOT NULL,
        media_url VARCHAR(1000) NOT NULL,
        media_type VARCHAR(30) NOT NULL DEFAULT 'image',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_move_media_request
          FOREIGN KEY (move_request_id) REFERENCES move_requests(id) ON DELETE CASCADE
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS request_status_history (
        id INT AUTO_INCREMENT PRIMARY KEY,
        move_request_id INT NOT NULL,
        status VARCHAR(60) NOT NULL,
        note TEXT NULL,
        changed_by VARCHAR(255) NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT fk_move_history_request
          FOREIGN KEY (move_request_id) REFERENCES move_requests(id) ON DELETE CASCADE
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS service_areas (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name_ar VARCHAR(255) NOT NULL,
        name_en VARCHAR(255) NULL,
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0
      )
    `);
    await pool.query(`
      CREATE TABLE IF NOT EXISTS faqs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        faq_key VARCHAR(160) NULL UNIQUE,
        question_ar TEXT NOT NULL,
        answer_ar TEXT NOT NULL,
        question_en TEXT NULL,
        answer_en TEXT NULL,
        page_slug VARCHAR(160) NOT NULL DEFAULT 'home',
        is_active TINYINT(1) NOT NULL DEFAULT 1,
        sort_order INT NOT NULL DEFAULT 0
      )
    `);
    try { await pool.query('ALTER TABLE faqs ADD COLUMN faq_key VARCHAR(160) NULL'); } catch (e) {}
    await pool.query(`
      DELETE duplicate_faq
      FROM faqs duplicate_faq
      INNER JOIN faqs original_faq
        ON duplicate_faq.page_slug = original_faq.page_slug
       AND duplicate_faq.question_ar = original_faq.question_ar
       AND duplicate_faq.id > original_faq.id
    `);
    try { await pool.query('ALTER TABLE faqs ADD UNIQUE INDEX uq_faq_key (faq_key)'); } catch (e) {}

    for (const service of DEFAULT_SERVICES) {
      const [serviceResult] = await pool.query(
        `INSERT INTO services (slug, icon_key, category, sort_order)
         VALUES (?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [service.slug, service.icon, service.category, service.sort_order]
      );
      const serviceId = serviceResult.insertId;
      for (const language of ['ar', 'en']) {
        await pool.query(
          `INSERT IGNORE INTO service_translations
           (service_id, language, title, short_description, body, bullets)
           VALUES (?, ?, ?, ?, ?, ?)`,
          [
            serviceId,
            language,
            service[`title_${language}`],
            service[`short_${language}`],
            service[`body_${language}`],
            JSON.stringify(service[`bullets_${language}`] || [])
          ]
        );
      }
    }

    for (const [slug, page] of Object.entries(DEFAULT_PAGE_CONTENT)) {
      const [pageResult] = await pool.query(
        `INSERT INTO site_pages
         (slug, seo_title_ar, seo_title_en, seo_description_ar, seo_description_en)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE id = LAST_INSERT_ID(id)`,
        [slug, page.seo.title_ar, page.seo.title_en, page.seo.description_ar, page.seo.description_en]
      );
      const pageId = pageResult.insertId;
      for (const section of page.sections) {
        await pool.query(
          `INSERT IGNORE INTO page_sections
           (page_id, section_key, section_type, content_ar, content_en, is_visible, sort_order)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [pageId, section.key, section.type, JSON.stringify(section.content_ar), JSON.stringify(section.content_en), section.is_visible ? 1 : 0, section.sort_order]
        );
      }
    }

    const [[areaCount]] = await pool.query('SELECT COUNT(*) AS count FROM service_areas');
    if (!Number(areaCount.count)) {
      for (let index = 0; index < DEFAULT_AREAS.length; index += 1) {
        const area = DEFAULT_AREAS[index];
        await pool.query('INSERT INTO service_areas (name_ar, name_en, sort_order) VALUES (?, ?, ?)', [area.name_ar, area.name_en, index + 1]);
      }
    }
    for (let index = 0; index < DEFAULT_FAQS.length; index += 1) {
      const faq = DEFAULT_FAQS[index];
      const faqKey = `home-default-${index + 1}`;
      const [[existingFaq]] = await pool.query(
        'SELECT id FROM faqs WHERE page_slug = ? AND question_ar = ? LIMIT 1',
        ['home', faq.question_ar]
      );
      if (existingFaq) {
        await pool.query(
          `UPDATE faqs SET faq_key = ?, answer_ar = ?, question_en = ?, answer_en = ?, sort_order = ? WHERE id = ?`,
          [faqKey, faq.answer_ar, faq.question_en, faq.answer_en, index + 1, existingFaq.id]
        );
      } else {
        await pool.query(
          `INSERT INTO faqs (faq_key, question_ar, answer_ar, question_en, answer_en, sort_order)
           VALUES (?, ?, ?, ?, ?, ?)
           ON DUPLICATE KEY UPDATE answer_ar = VALUES(answer_ar), question_en = VALUES(question_en), answer_en = VALUES(answer_en), sort_order = VALUES(sort_order)`,
          [faqKey, faq.question_ar, faq.answer_ar, faq.question_en, faq.answer_en, index + 1]
        );
      }
    }

    // Seed defaults
    if (process.env.ADMIN_USERNAME && process.env.ADMIN_PASSWORD) {
      const adminPasswordHash = await hashPassword(process.env.ADMIN_PASSWORD);
      await pool.query(
        `INSERT INTO users (username, password, role) VALUES (?, ?, ?)
         ON DUPLICATE KEY UPDATE password = VALUES(password), role = VALUES(role)`,
        [process.env.ADMIN_USERNAME, adminPasswordHash, 'admin']
      );
    } else {
      console.warn('ADMIN_USERNAME and ADMIN_PASSWORD are not set; skipping default admin seed.');
    }
    const defaultTemplates = {
      'wa_template_new_order': DEFAULT_ORDER_CONFIRMATION_TEMPLATE,
      'wa_template_booking_order': DEFAULT_BOOKING_CONFIRMATION_TEMPLATE,
      'wa_template_shipped': 'مرحباً، طلبك رقم {order_id} تم شحنه وهو في طريقه إليك!',
      'wa_template_delivered': 'مرحباً، نأمل أن يكون طلبك رقم {order_id} قد نال إعجابك. شكراً لتسوقك معنا!'
    };

    for (const [key, val] of Object.entries({ ...DEFAULT_SITE_SETTINGS, ...defaultTemplates })) {
      await pool.query('INSERT IGNORE INTO settings (setting_key, setting_value) VALUES (?, ?)', [key, val]);
    }
    await pool.query("UPDATE settings SET setting_value = 'Joo Move' WHERE setting_key = 'store_name'");
    await pool.query(
      `UPDATE settings
       SET setting_value = REPLACE(
         REPLACE(setting_value, 'سعر القيراط', 'سعر الصينية'),
         '{price_per_qirat}',
         '{price_per_tray}'
       )
       WHERE setting_key = 'wa_template_booking_order'`
    );
    await pool.query(
      `UPDATE settings
       SET setting_value = ?
       WHERE setting_key = 'hero_title'
         AND (setting_value IS NULL OR setting_value = '' OR setting_value LIKE '%أناقة طفلك%')`,
      [DEFAULT_SITE_SETTINGS.hero_title]
    );
    await pool.query(
      `UPDATE settings
       SET setting_value = ?
       WHERE setting_key = 'hero_desc'
         AND (setting_value IS NULL OR setting_value = '' OR setting_value LIKE '%ملابس الأطفال%')`,
      [DEFAULT_SITE_SETTINGS.hero_desc]
    );
    await pool.query(
      `UPDATE settings
       SET setting_value = ?
       WHERE setting_key = 'hero_image'
         AND (setting_value IS NULL OR setting_value = '' OR setting_value LIKE '%unsplash.com%')`,
      [DEFAULT_SITE_SETTINGS.hero_image]
    );
    await pool.query(
      `UPDATE settings
       SET setting_value = ?
       WHERE setting_key = 'wa_template_new_order'
         AND (setting_value IS NULL OR setting_value = '' OR setting_value = ?)`,
      [DEFAULT_ORDER_CONFIRMATION_TEMPLATE, LEGACY_ORDER_CONFIRMATION_TEMPLATE]
    );

    console.log("MySQL Database & Tables initialized successfully.");
    
    // WhatsApp is started only from the admin WhatsApp screen so storefront APIs stay lightweight.
  } catch (error) {
    console.error("Database connection/migration failed:", error);
    throw error;
  }

  return pool;
}
