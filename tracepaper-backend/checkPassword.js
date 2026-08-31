require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("./db");

async function checkPassword() {
  try {
    const result = await pool.query(
      `
      SELECT email, password_hash, role, is_active
      FROM users
      WHERE email = $1
      `,
      ["approver@tracepaper.com"]
    );

    if (result.rows.length === 0) {
      console.log("USER NOT FOUND");
      return;
    }

    const user = result.rows[0];

    console.log("Email:", user.email);
    console.log("Role:", user.role);
    console.log("Active:", user.is_active);
    console.log("Hash exists:", !!user.password_hash);

    const match = await bcrypt.compare(
      "Approver@123",
      user.password_hash
    );

    console.log("Password match:", match);
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

checkPassword();