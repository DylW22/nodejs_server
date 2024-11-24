import pkg from "pg";

import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;

if (!process.env.PG_USER) {
  throw new Error("Please define admin username (PG_USER) env variable.");
}
if (!process.env.PG_PASSWORD) {
  throw new Error("Please define admin password (PG_PASSWORD) env variable.");
}
if (!process.env.INSTANCE_CONNECTION_NAME) {
  throw new Error(
    "Please define instance connection name (INSTANCE_CONNECTION_NAME) env variable."
  );
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  throw new Error(
    "Please define ADC (GOOGLE_APPLICATION_CREDENTIALS_JSON) env variable."
  );
}

if (!process.env.NODE_ENV) {
  throw new Error("Please define NODE_ENV variable.");
}

let pool: pkg.Pool;
let users_pool: pkg.Pool;
//let test_pool: pkg.Pool;
const createPools = async () => {
  if (!pool) {
    pool = pool = new Pool({
      user: process.env.PG_USER,
      host: "34.81.154.34",
      database: "BlogPosts", // Your database name
      password: process.env.PG_PASSWORD,
      port: 5432, // Default PostgreSQL port
      //max: 5,
      //idleTimeoutMillis: 30000, // Time to wait before closing idle connections
      //connectionTimeoutMillis: 10000, // Timeout for a connection to be established
    });
  }

  if (!users_pool) {
    users_pool = new Pool({
      user: process.env.PG_USER,
      host: "34.81.154.34",
      database: "Users", // Your database name
      password: process.env.PG_PASSWORD,
      port: 5432,
      //max: 5,
      //idleTimeoutMillis: 30000, // Time to wait before closing idle connections
      //connectionTimeoutMillis: 10000, // Timeout for a connection to be established
    });
  }

  // if (!test_pool) {
  //   test_pool = new Pool({
  //     user: "", //postgres
  //     host: "",
  //     database: "", // Your database name
  //     password: "", //use password for the DB
  //     port: 5432,
  //     max: 5,
  //     idleTimeoutMillis: 30000, // Time to wait before closing idle connections
  //     connectionTimeoutMillis: 2000, // Timeout for a connection to be established
  //   });
  // }
};

await createPools();

export { pool, users_pool, createPools };
