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
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  //await testQuery();
  if (request.url === "/ip") {
    try {
      const res = await fetch("https://api.ipify.org?format=json");
      const data = await res.json();
      const ip = data.ip;
      sendResponse(response, 200, {
        message: `IP to add: ${ip}`,
      });
    } catch (error) {
      sendResponse(response, 500, {
        message: `Error fetching IP ${error}`,
      });
    }
  } else {
    sendResponse(response, 200, {
      message: `Welcome to the API!`,
    });
  }
}
