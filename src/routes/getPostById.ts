import { IncomingMessage, ServerResponse } from "node:http";
import url from "url";
import { runMiddleware, sendResponse } from "../utilities/utils.js";
import { getPostById } from "../controllers/PostController.js";
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
  //console.time("getByPostById handler run time");
  if (request.method === "GET") {
    const parsedUrl = url.parse(request.url || "", true);
    let normalizedPathname = parsedUrl.pathname || "";
    if (normalizedPathname.endsWith("/")) {
      normalizedPathname = normalizedPathname.slice(0, -1);
    }

    const id = normalizedPathname.split("/")[2] || null;
    if (id) {
      //   sendResponse(response, 200, {
      //     message: `GET method on /POSTS called with id: ${id}`,
      //   });
      runMiddleware(request, response, middlewares, async () => {
        //console.time("getPostById execution time");
        await getPostById(id, response);
        //console.timeEnd("getPostById execution time");
      });
    } else {
      //error
      sendResponse(response, 200, {
        message: "PUT method on /POSTS called without query param..",
      });
    }
    //console.timeEnd("getByPostById handler run time");
  } else {
    sendResponse(response, 405, { message: "Method Not Allowed" });
  }
}
