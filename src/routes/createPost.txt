import { ServerResponse } from "http";

import { runMiddleware, sendResponse } from "../utilities/utils.js";
import {
  corsMiddleware,
  errorMiddleware,
  jwtAuthMiddleware,
  loggingMiddleware,
  rateLimitMiddleware,
} from "../middlewares.js";
import { createPost } from "../controllers/PostController.js";
import { CreatePostRequest } from "../types.js";

const middlewares = [
  rateLimitMiddleware, //4.94ms, 7.125ms
  loggingMiddleware, //49ms, 39ms
  errorMiddleware, //3.25ms, 8.52ms
  jwtAuthMiddleware,
];

export default async function handler(
  request: CreatePostRequest,
  response: ServerResponse
): Promise<void> {
  //console.time("createPost handler run time");
  if (request.method === "POST") {
    runMiddleware(request, response, middlewares, async () => {
      const corsHandled = corsMiddleware(request, response);
      if (corsHandled) return;

      //console.time("createPost execution time");
      await createPost(request, response);
      //sendResponse(response, 200, { message: "POST method on /POSTS called." });
      //console.timeEnd("createPost execution time");
    });
    //console.timeEnd("createPost handler run time");
  } else {
    sendResponse(response, 405, { message: "Method Not Allowed" });
  }
}
