import dotenv from "dotenv";
import pkg from "pg";
const { Client } = pkg;

dotenv.config();

if (!process.env.SUPABASE_HOST) {
  throw new Error("Please define SUPABASE_HOST env variable.");
}
if (!process.env.SUPABASE_USER) {
  throw new Error("Please define SUPABASE_USER env variable.");
}

if (!process.env.SUPABASE_PASSWORD) {
  throw new Error("Please define SUPABASE_PASSWORD env variable.");
}
if (!process.env.SUPABASE_DB) {
  throw new Error("Please define SUPABASE_DB env variable.");
}

let clientInstance: pkg.Client | null = null;
const getDbClient = () => {
  if (!clientInstance) {
    clientInstance = new Client({
      host: process.env.SUPABASE_HOST,
      port: 6543,
      user: process.env.SUPABASE_USER,
      database: process.env.SUPABASE_DB,
      password: process.env.SUPABASE_PASSWORD,
      ssl: {
        rejectUnauthorized: false,
      },
    });
    clientInstance.connect().catch((err) => {
      console.error("Failed to connect to database", err);
      clientInstance = null;
      throw new Error("Database connection failed");
    });
  }
  return clientInstance;
};
export { getDbClient };
