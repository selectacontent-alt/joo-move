import pool from './src/lib/db.js';
async function run() {
  try {
    const [rows] = await pool.query("SELECT * FROM orders WHERE id='49259358' OR order_number='49259358'");
    console.log(JSON.stringify(rows[0], null, 2));
  } catch(e) {
    console.error(e);
  } finally {
    process.exit(0);
  }
}
run();
