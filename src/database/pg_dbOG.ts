import pkg from "pg";
// import path from "path";
import fs from "fs";

// import {
//   authenticateWithSecret,
//   // cloudAuthenticate,
// } from "./cloudAuthenticate.js";
import dotenv from "dotenv";
dotenv.config();
const { Pool } = pkg;
import {
  AuthTypes,
  Connector,
  IpAddressTypes,
} from "@google-cloud/cloud-sql-connector";
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

//Put JSON string in env variable

//Convert JSON string into JSON object

//Write to gcp-credentials.json file
//const tmpCredentialsPath = path.join("src/tmp", "gcp-credentials.json");
const tmpFilePath = "src/tmp/gcp-credentials.json";
//let testObj = { testString: "Test Value" };
console.log("SET ENV VAR: ", process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
// let testObj = {
//   type: "service_account",
//   project_id: "fifth-pact-440808-b3",
//   private_key_id: "0be5f25bb5bdc0f25d32e40a83c4d80faee4ce10",
//   private_key:
//     "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQCaakzIJaIIGJPy\nqE+k5ohYynK4psqFvzRKvZr6zBKvLNOuMUNYIGHg6vA22hwy/M+3LsqevtQW8UUS\n3MlFP9WMGwBvC1/msP/HhcX/1eLVPKGcnANvvN2w8u3kt9A32+LmcHPEqSUrg98c\n4ECtrGnu4a/R5ql8EKFwyOFqIJtlTWWviz+aXlVvUnDf1B2l3rBr8vkDZKZuKsq3\nL26dc9eMVgjyB9vhOUcNciFGj+WSKM3DmkLKBFGe37LvDi9hGFug9hNng7NHEjwq\nSMVUBskS3+fX2C1dsOec/1aQTD3OzezOKLEbtVFrHUT/NwX0k4/sGF6JPY+8LTtm\nS7hlCQf/AgMBAAECggEAA2JcXRqYtYK3DgoVohs8q8LWxtM+UbYXaE1Fg0T2Yokh\n+TRdMdDr3ukR61yBDQuwuxFhzB7fORgql7eSYFvTdfxK2HmFrYxS3sWWHv2fY2Wu\nc7yQ8AxR84SE0DlzF8ullRVWhDM3fFT/OSZ1Dxld7P1cmXDBECtbzm6opLx4NhJ2\ndk/jPs30zgqutvRma0G3DctvEDvWyTzefkZn9RMySRbXE9ePQKf5JrOK7PTK5yh6\nEqWEp3/KAPtsILbz0Qx0oFwC2QBwtsilY38QBLGsGa5oJxXUbhQ7X2uICNCxA0Z9\nHwRmemci0oAQ5M1KeBmg7oEVKiVj/QPtp9nhXjrleQKBgQDKcCRderS6YYRNFVjK\nN5oZvJWmKD47Jsa+ZavPMqM1/98cKtwgwvoZhaP0YfoODjlF7E2fs9qal5hfu3zM\nx4Bki2DyxTqKuaJLn6Lwrb6cGEWngKzm2IRy6FS+DY4zVT7vHmL+zu/h9LaneShw\naQjzceP5Bgd5UX76iFlzfL50MwKBgQDDRWY/zz5/qoC2PkCfALDl6ECYIOpZ+gpT\npRA0v76f8/6l9TghgOMvbiKa1RHqiRiZ/6cQ0JLXY3ebLr3J+V/SGsGmAh+AvLkp\nfazeQg1WJZW00Pa5YISoz7ccGkm+6RoAF3gyPvAch+MwO1hS4E2IE2wBIJwSTfDa\nERAN36ExBQKBgCjJN0puMoNqqlEtf9oeIboVuMDlUsRwJ5KswVTZivCSQM1YBUnE\nfsctmb7fDpZOX1OrLGiEwAJtkJGZIKfRehjHzBydiBHzHLPH0fhTyReB/GanEi7g\naK8OCCTSblgBUNC0epWD8+i+eR581pzvTJJf2+KMSG008jRfzEXsWCLpAoGBAJVF\n0SNIVzua6KfoMNgb3B70i6R/zQaZWRmWHixkw+Fc0TamnZEnCQTyCWwZI4gJ44+d\n2mXFO+uBcyZi9dyXUMO5hn1UNCbinh10oBiLn8xSEP5Xm7Qcb2zo1M6b3fIeGa0m\nQ9ENQdpdmrP9OcipBTvXtQGrnwNzJ4Jb9szUPlHNAoGBAMck5US/QvWdg5dfaqVg\nEL5qiTnThbFVlMgsn6mHGWwzjnZDkpPcVYHStDjy6rUvaCdQq0qmEFiPcXHiy2ix\nqWAS/N8NlU3yVKTHlmi4iAB5guRYpTw68g+Z16CTD6qHl/T67BbWj2KETDP2dtLy\nTh2W1tjx0nVKvd1dU2g1mcL+\n-----END PRIVATE KEY-----\n",
//   client_email: "cloud-sql-proxy@fifth-pact-440808-b3.iam.gserviceaccount.com",
//   client_id: "106310579542603972778",
//   auth_uri: "https://accounts.google.com/o/oauth2/auth",
//   token_uri: "https://oauth2.googleapis.com/token",
//   auth_provider_x509_cert_url: "https://www.googleapis.com/oauth2/v1/certs",
//   client_x509_cert_url:
//     "https://www.googleapis.com/robot/v1/metadata/x509/cloud-sql-proxy%40fifth-pact-440808-b3.iam.gserviceaccount.com",
//   universe_domain: "googleapis.com",
// };
//fs.writeFileSync(tmpFilePath, JSON.stringify(testObj));

fs.writeFileSync(
  tmpFilePath,
  JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON)
); //Need to parse

//process.env.testVar = JSON.parse(fs.readFileSync("src/tmp/testFile.json"));
process.env.testVar = JSON.stringify(
  JSON.parse(fs.readFileSync(tmpFilePath, "utf8"))
);
//Auto generate file here
process.env.GOOGLE_APPLICATION_CREDENTIALS = "src/tmp/gcp-credentials.json";
//This method works but is unsafe as the json needs to be committed to git.
//process.env.GOOGLE_APPLICATION_CREDENTIALS = "src/tmp/gcp-credentials.json"; //test remove
//console.log("process.env.GOOGLE_APPLICATION_CREDENTIALS");
console.log("Connecting..");
// console.log("env variables: ", process.env);
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
      //user: "dylanwhitehouse22@fifth-pact-440808-b3.iam",
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
      //user: "dylanwhitehouse22@fifth-pact-440808-b3.iam",
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
