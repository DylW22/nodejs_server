import { IncomingMessage, ServerResponse } from "node:http";
import { sendResponse } from "../utilities/utils.js";
//import { pool } from "../database/pg_db.js";

// const testQuery = async () => {
//   const query = "SELECT * FROM BlogPosts"; //"SELECT * FROM test_table"
//   try {
//     const results = await pool.query(query);
//     return results?.rows.length > 0;
//   } catch (error) {
//     return false;
//   }
// };

export default async function handler(
  _request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  //await testQuery();
  sendResponse(response, 200, {
    message: `Welcome to the API!`,
  });
}
