require("dotenv").config();

const pool = require("./db");

async function findApprover() {
  try {
    const result = await pool.query(`
      SELECT id, full_name, email, role, is_active
      FROM users
      WHERE LOWER(role) LIKE '%approver%'
      ORDER BY id
    `);

    console.table(result.rows);
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

findApprover();