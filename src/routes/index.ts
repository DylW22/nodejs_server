import { IncomingMessage, ServerResponse } from "node:http";
import { runMiddleware, sendResponse } from "../utilities/utils.js";
import { corsMiddleware2 } from "../middlewares.js";

const middlewares = [corsMiddleware2];

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  runMiddleware(request, response, middlewares, async () => {
    if (request.url === "/ip" && request.method === "GET") {
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
    } else if (request.url === "/api-login" && request.method === "POST") {
      //console.log("api-login POST request made.");

      //Validate incoming username + password, issue token
      sendResponse(response, 200, { message: "api-login POST request made" });

      //else
      //sendResponse(response, 501, {message: "Please contact Dylan for valid username and password"});
    } else {
      sendResponse(response, 200, {
        message: `Welcome to the API!`,
      });
    }
  });
}
