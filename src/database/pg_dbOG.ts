import pkg from "pg";
import fs from "fs";

import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;
import {
  AuthTypes,
  Connector,
  IpAddressTypes,
} from "@google-cloud/cloud-sql-connector";

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

//vercel --prod
//const tmpFilePath = "../../tmp/gcp-credentials.json";

//vercel dev
//const tmpFilePath = "tmp/gcp-credentials.json"
const tmpFilePath =
  process.env.NODE_ENV === "production"
    ? "../../tmp/gcp-credentials.json"
    : "tmp/gcp-credentials.json";

fs.writeFileSync(
  tmpFilePath,
  JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
);

process.env.testVar = JSON.stringify(
  JSON.parse(fs.readFileSync(tmpFilePath, "utf8"))
);

process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpFilePath;

const connector = new Connector();

const clientOpts = await connector.getOptions({
  instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
  ipType: IpAddressTypes.PUBLIC,
  authType: AuthTypes.IAM,
});
let pool: pkg.Pool;
let users_pool: any;
const createPools = async () => {
  if (!pool) {
    pool = pool = new Pool({
      ...clientOpts,
      user: process.env.PG_USER,
      host: "localhost", //34.81.181.102
      database: "BlogPosts", // Your database name
      password: process.env.PG_PASSWORD,
      port: 5432, // Default PostgreSQL port
      max: 5,
    });
  }

  if (!users_pool) {
    users_pool = new Pool({
      ...clientOpts,
      user: process.env.PG_USER,
      host: "localhost", //34.81.181.102
      database: "Users", // Your database name
      password: process.env.PG_PASSWORD,
      port: 5432,
    });
  }
};

await createPools();

// const testQuery = async () => {
//   try {
//     const { rows: poolRows } = await pool.query("SELECT * FROM blog_posts");
//     console.table(poolRows); // prints returned time value from server

//     const { rows: userRows } = await users_pool.query("SELECT * FROM users");
//     console.table(userRows); // prints returned time value from server
//   } catch (error) {
//     console.error("Error querying database:", error);
//   } finally {
//     await pool.end();
//     connector.close();
//   }
// };
// await testQuery();
export { pool, users_pool };
