import { IncomingMessage, ServerResponse } from "node:http";
import url from "url";
import { runMiddleware, sendResponse } from "../utilities/utils.js";
import {
  corsMiddleware2,
  errorMiddleware,
  jwtAuthMiddleware,
  loggingMiddleware,
  rateLimitMiddleware,
} from "../middlewares.js";
import { deletePost } from "../controllers/postControllers.js";

const middlewares = [
  rateLimitMiddleware, //4.94ms, 7.125ms
  corsMiddleware2,
  loggingMiddleware, //49ms, 39ms
  errorMiddleware, //3.25ms, 8.52ms
  jwtAuthMiddleware,
];

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
): Promise<void> {
  runMiddleware(request, response, middlewares, async () => {
    if (request.method === "DELETE") {
      const parsedUrl = url.parse(request.url || "", true);
      let normalizedPathname = parsedUrl.pathname || "";
      if (normalizedPathname.endsWith("/")) {
        normalizedPathname = normalizedPathname.slice(0, -1);
      }
      const id = normalizedPathname.split("/")[2] || null;
      if (id) {
        await deletePost(id, response);
      } else {
        sendResponse(response, 400, { message: "Invalid ID" });
      }
    } else {
      sendResponse(response, 405, { message: "Method Not Allowed" });
    }
  });
}
