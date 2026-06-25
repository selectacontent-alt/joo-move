const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');

async function updatePassword() {
  try {
    const pool = mysql.createPool({
      host: '127.0.0.1',
      user: 'root',
      password: '',
      database: 'el_rehab_db',
    });

    const passwordHash = await bcrypt.hash('scmarketing@11321132', 10);
    const [result] = await pool.query('UPDATE users SET password = ? WHERE username = ?', [passwordHash, 'admin']);
    
    console.log('Password updated for admin:', result.affectedRows);

    // Also update if there's a scmarketing user just in case
    const [result2] = await pool.query('UPDATE users SET password = ? WHERE username = ?', [passwordHash, 'scmarketing']);
    const [result3] = await pool.query('UPDATE users SET password = ? WHERE username = ?', [passwordHash, 'scmarkting']);
    
    console.log('Password updated for scmarketing:', result2.affectedRows, result3.affectedRows);

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

updatePassword();
