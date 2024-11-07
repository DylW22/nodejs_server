import pkg from "pg";
// import path from "path";
// import fs from "fs";

import {
  authenticateWithSecret,
  // cloudAuthenticate,
} from "./cloudAuthenticate.js";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;
import { Connector } from "@google-cloud/cloud-sql-connector";
// import accessSecret from "./retrieveSecret.js";
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
//Works locally
// Path to store the temporary credentials JSON
//const tmpCredentialsPath = path.join("src/tmp", "gcp-credentials.json");

// const decodeResult = Buffer.from(
//   process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON,
//   "base64"
// ).toString("utf-8");

//fs.writeFileSync(tmpCredentialsPath, decodeResult);
//process.env.GOOGLE_APPLICATION_CREDENTIALS = tmpCredentialsPath;

//This method works but is unsafe as the json needs to be committed to git.
//process.env.GOOGLE_APPLICATION_CREDENTIALS = "src/tmp/gcp-credentials.json"; //test remove
//console.log("process.env.GOOGLE_APPLICATION_CREDENTIALS");

// const secretName = await accessSecret("my-credentials");
// //process.env.GOOGLE_APPLICATION_CREDENTIALS = secretName;
// console.log("ENV var: ", process.env.GOOGLE_APPLICATION_CREDENTIALS);
// console.log("secretName: ", secretName);

// let client: any;
// async function run() {
//   try {
//     const result = await cloudAuthenticate();
//     if (result) {
//       client = result.client;
//     } else {
//       console.log("Authentication failed.");
//     }
//   } catch (error) {
//     console.error("Error during authentication:", error);
//   }
// }

// async function run2() {
//   try {
//     client = await authenticateWithSecret();
//   } catch (error) {
//     console.error("Error during authentication:", error);
//   }
// }

// await run2();
// //await run(); // Ensure client is set before proceeding
// const connector = new Connector({ auth: client });

// const clientOpts = await connector.getOptions({
//   instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
//   ipType: "PUBLIC" as any,
// });

// const pool = new Pool({
//   ...clientOpts,
//   user: process.env.PG_USER,
//   host: "localhost", //34.81.181.102
//   database: "BlogPosts", // Your database name
//   password: process.env.PG_PASSWORD,
//   port: 5432, // Default PostgreSQL port
// });

// const users_pool = new Pool({
//   ...clientOpts,
//   user: process.env.PG_USER,
//   host: "localhost", //34.81.181.102
//   database: "Users", // Your database name
//   password: process.env.PG_PASSWORD,
//   port: 5432,
// });

// export { pool, users_pool };

// if (!process.env.INSTANCE_CONNECTION_NAME) {
//   throw new Error(
//     "Please define instance connection name (INSTANCE_CONNECTION_NAME) env variable."
//   );
// }

async function setupDatabaseConnection() {
  try {
    const authClient = await authenticateWithSecret();
    const connector = new Connector({ auth: authClient });
    const clientOpts = await connector.getOptions({
      instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME as string,
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

    return { pool, users_pool };
  } catch (error) {
    console.error("Error setting up database connection:", error);
  }
}

export default setupDatabaseConnection;
