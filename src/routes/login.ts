// import url from "url";
import { IncomingMessage, ServerResponse } from "http";
import { login } from "../controllers/auth.js";
import { runMiddleware, sendResponse } from "../utilities/utils.js";
import {
  corsMiddleware,
  errorMiddleware,
  loggingMiddleware,
  rateLimitMiddleware,
} from "../middlewares.js";

const middlewares = [
  rateLimitMiddleware, //4.94ms, 7.125ms
  loggingMiddleware, //49ms, 39ms
  errorMiddleware, //3.25ms, 8.52ms
];

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  if (request.method === "POST") {
    runMiddleware(request, response, middlewares, async () => {
      const corsHandled = corsMiddleware(request, response);
      if (corsHandled) return;
      await login(request, response);
      //sendResponse(response, 200, { message: "POST method on LOGIN called." });
    });
  } else {
    sendResponse(response, 405, { message: "Method Not Allowed" });
  }
}
