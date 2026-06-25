const fs = require('fs');

let content = fs.readFileSync('src/lib/db.js', 'utf8');

// Fix the mangled line:
//     await pool.query(`
//       CREATE TABLE IF NOT EXISTS media_gallery ( id INT AUTO_INCREMENT PRIMARY KEY, title VARCHAR(255) NULL, description TEXT NULL, image_url VARCHAR(1000) NOT NULL, sort_order INT DEFAULT 0, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP );\n\n    await pool.query(\n      CREATE TABLE IF NOT EXISTS coupons (
//         id INT AUTO_INCREMENT PRIMARY KEY,

content = content.replace(/await pool\.query\(`[\s\S]*?CREATE TABLE IF NOT EXISTS media_gallery[\s\S]*?PRIMARY KEY,/, `    await pool.query(\`
      CREATE TABLE IF NOT EXISTS media_gallery (
        id INT AUTO_INCREMENT PRIMARY KEY,
        title VARCHAR(255) NULL,
        description TEXT NULL,
        image_url VARCHAR(1000) NOT NULL,
        sort_order INT DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    \`);

    await pool.query(\`
      CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,`);

fs.writeFileSync('src/lib/db.js', content);
