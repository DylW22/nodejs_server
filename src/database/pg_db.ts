import pkg from "pg";
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

/*
import {CloudSQLAuthProxy} from '@google-cloud/cloud-sql-auth-proxy';
import pkg from 'pg';
const {Pool} from 'pkg';

async function startDatabase(){
  const proxy = new CloudSQLAuthProxy({
    instance: 'YOUR_PROJECT_ID:YOUR_REGION:_YOUR_INSTANCE_ID',
    credentials: JSON.parse(process.env.GCP_SERVICE_ACCOUNT_KEY),
  })

  await proxy.start();

  const
}

*/
