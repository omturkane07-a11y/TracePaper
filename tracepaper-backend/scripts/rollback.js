const { Client } = require("pg");
require("dotenv").config();

const client = new Client({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

async function rollback() {
  try {
    await client.connect();

    console.log("Connected to PostgreSQL.");

    await client.query("BEGIN");

    await client.query(`
      DROP TABLE IF EXISTS audit_logs CASCADE;
      DROP TABLE IF EXISTS leak_cases CASCADE;
      DROP TABLE IF EXISTS investigations CASCADE;
      DROP TABLE IF EXISTS paper_fingerprints CASCADE;
      DROP TABLE IF EXISTS question_papers CASCADE;
      DROP TABLE IF EXISTS exams CASCADE;
      DROP TABLE IF EXISTS exam_centers CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `);

    await client.query(`
      DROP TABLE IF EXISTS schema_migrations;
    `);

    await client.query("COMMIT");

    console.log("Database schema rolled back successfully.");
  } catch (error) {
    await client.query("ROLLBACK");

    console.error("Rollback failed:");
    console.error(error.message);

    process.exitCode = 1;
  } finally {
    await client.end();
  }
}

rollback();