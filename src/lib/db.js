import mysql from 'mysql2/promise';
import { hashPassword } from './auth';
import {
  DEFAULT_BOOKING_CONFIRMATION_TEMPLATE,
  DEFAULT_ORDER_CONFIRMATION_TEMPLATE,
  LEGACY_ORDER_CONFIRMATION_TEMPLATE
} from './whatsappTemplates';
import { DEFAULT_SITE_SETTINGS } from './homeSettings';

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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS media_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NULL,
        description TEXT NULL,
        image_url VARCHAR(1000) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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
