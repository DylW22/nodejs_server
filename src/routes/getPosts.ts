import { IncomingMessage, ServerResponse } from "http";
import { getPosts } from "../controllers/PostController.js";
import { runMiddleware, sendResponse } from "../utilities/utils.js";
import {
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
  if (request.method === "GET") {
    runMiddleware(request, response, middlewares, async () => {
      // response.setHeader(
      //   "Cache-Control",
      //   "public, max-age=60, s-maxage=600, stale-while-revalidate=59"
      // );
      await getPosts(response);

      //sendResponse(response, 200, { message: "GET POSTS" });
    });
  } else {
    sendResponse(response, 405, { message: "Method Not Allowed" });
  }
}
