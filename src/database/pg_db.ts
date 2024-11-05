import pkg from "pg";
const { Pool } = pkg;

if (!process.env.PG_USER) {
  throw new Error("Please define admin username (PG_USER) env variable.");
}
if (!process.env.PG_PASSWORD) {
  throw new Error("Please define admin password (PG_PASSWORD) env variable.");
}

const pool = new Pool({
  user: process.env.PG_USER,
  host: "34.81.181.102",
  database: "BlogPosts", // Your database name
  password: process.env.PG_PASSWORD,
  port: 5432, // Default PostgreSQL port
});

const users_pool = new Pool({
  user: process.env.PG_USER,
  host: "34.81.181.102",
  database: "Users", // Your database name
  password: process.env.PG_PASSWORD,
  port: 5432,
});

export { pool, users_pool };
