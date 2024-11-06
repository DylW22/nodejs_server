import pkg from "pg";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;
import { Connector } from "@google-cloud/cloud-sql-connector";
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

// Path to store the temporary credentials JSON
const tmpCredentialsPath = path.join("src/tmp", "gcp-credentials.json");

const decodeResult = Buffer.from(
  process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
  "base64"
).toString("utf-8");

// Decode and write the JSON to the temporary path
fs.writeFileSync(tmpCredentialsPath, decodeResult);
process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpCredentialsPath;
//New
const connector = new Connector();

const clientOpts = await connector.getOptions({
  instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
  ipType: "PUBLIC" as any,
});

const pool = new Pool({
  ...clientOpts,
  user: process.env.PG_USER,
  host: "localhost", //34.81.181.102
  database: "BlogPosts", // Your database name
  password: process.env.PG_PASSWORD,
  port: 5432, // Default PostgreSQL port
});

const users_pool = new Pool({
  ...clientOpts,
  user: process.env.PG_USER,
  host: "localhost", //34.81.181.102
  database: "Users", // Your database name
  password: process.env.PG_PASSWORD,
  port: 5432,
});

export { pool, users_pool };
