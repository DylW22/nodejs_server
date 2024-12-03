// import url from "url";
import { IncomingMessage, ServerResponse } from "http";
import { login, logout, register } from "../controllers/auth.js";
import { runMiddleware, sendResponse } from "../utilities/utils.js";
import {
  corsMiddleware2,
  errorMiddleware,
  loggingMiddleware,
  rateLimitMiddleware,
} from "../middlewares.js";

const middlewares = [
  rateLimitMiddleware, //4.94ms, 7.125ms
  corsMiddleware2,
  loggingMiddleware, //49ms, 39ms
  errorMiddleware, //3.25ms, 8.52ms
];

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  runMiddleware(request, response, middlewares, async () => {
    if (request.method === "POST") {
      switch (request.url) {
        case "/login":
          await login(request, response);
          break;
        case "/logout":
          await logout(request, response);
          break;
        case "/register":
          await register(request, response);
          break;
        default:
          sendResponse(response, 404, { message: "Invalid Route" });
      }
    } else {
      sendResponse(response, 405, { message: "Method Not Allowed" });
    }
  });
}
