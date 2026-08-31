require("dotenv").config();

const pool = require("./db");

async function checkQuestionPapers() {
  try {
    const result = await pool.query(`
      SELECT *
      FROM question_papers
      ORDER BY id DESC
    `);

    console.table(result.rows);
  } catch (error) {
    console.error("ERROR:", error.message);
  } finally {
    await pool.end();
  }
}

checkQuestionPapers();