import { IncomingMessage, ServerResponse } from "http";
import { getPosts } from "../controllers/postControllers.js";
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
  if (request.method === "GET") {
    runMiddleware(request, response, middlewares, async () => {
      await getPosts(response);
    });
  } else {
    sendResponse(response, 405, { message: "Method Not Allowed" });
  }
}
