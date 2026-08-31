require("dotenv").config();

const bcrypt = require("bcrypt");
const pool = require("./db");

async function resetPassword() {
  try {
    const email = "approver@tracepaper.com";
    const newPassword = "Approver@123";

    const passwordHash = await bcrypt.hash(newPassword, 10);

    const result = await pool.query(
      `
      UPDATE users
      SET password_hash = $1
      WHERE email = $2
      RETURNING id, full_name, email, role, is_active
      `,
      [passwordHash, email]
    );

    if (result.rows.length === 0) {
      console.log("USER NOT FOUND");
      return;
    }

    console.log("PASSWORD RESET SUCCESSFULLY");
    console.table(result.rows);

    const verify = await bcrypt.compare(
      newPassword,
      passwordHash
    );

    console.log("New password verified:", verify);
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

resetPassword();