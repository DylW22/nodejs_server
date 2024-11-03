import { CreatePostRequest, UploadFile } from "./types";

import http, { IncomingMessage, ServerResponse } from "node:http";
import url from "url";
import dotenv from "dotenv";
dotenv.config();

import {
  sendResponse,
  runMiddleware,
  refreshTokenBlacklist,
} from "./utilities/utils.js";

import {
  errorMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
  jwtAuthMiddleware,
  jsonParsingMiddleware,
} from "./middlewares.js";

import { RATE_LIMIT_WINDOW } from "./globals.js";

import { hostname, port } from "./config.js";

import { login, logout } from "./controllers/auth.js";
import {
  getPosts,
  getPostById,
  createPost,
  updatePost,
  deletePost,
} from "./controllers/PostController.js";

import { uploadFile } from "./controllers/UploadController.js";

setInterval(refreshTokenBlacklist, RATE_LIMIT_WINDOW);

// Type guard to check if request is an UploadFile
export const isUploadFile = (
  request: IncomingMessage
): request is UploadFile => {
  return (request as UploadFile).file !== undefined;
};

//Old
export const isMutatePost = (
  request: IncomingMessage
): request is CreatePostRequest => {
  return (request as CreatePostRequest).body !== undefined;
};

//New:
// function isCreatePostRequest(body: any): body is CreatePostRequest {
//   return (
//     body && typeof body.title === "string" && typeof body.content === "string"
//   );
// }

const server = http.createServer(
  //request: IncomingMessage
  (request: IncomingMessage, response: ServerResponse) => {
    const parsedUrl = url.parse(request.url || "", true);
    const method = request.method;
    const id = parsedUrl.pathname ? parsedUrl.pathname.split("/")[2] : null; // Extract ID from URL

    const middlewares = [
      rateLimitMiddleware,
      loggingMiddleware,
      errorMiddleware,
      jsonParsingMiddleware,
      ...(parsedUrl.pathname && parsedUrl.pathname.startsWith("/posts")
        ? [jwtAuthMiddleware]
        : []),
    ];

    runMiddleware(request, response, middlewares, () => {
      switch (method) {
        case "POST":
          switch (parsedUrl.pathname) {
            case "/upload":
              if (isUploadFile(request)) {
                uploadFile(request, response);
              } else {
                sendResponse(response, 400, {
                  message: "Invalid request type for upload",
                });
              }

              break;
            case "/login":
              login(request, response);
              break;
            case "/logout":
              logout(request, response);
              break;
            case "/posts":
              if (isMutatePost(request)) {
                createPost(request, response);
              } else {
                console.log("Error 2");
                sendResponse(response, 400, {
                  message: "Invalid request type for createPost",
                });
              }

              break;
            default:
              sendResponse(response, 404, { message: "Not found" });
          }
          break;

        case "GET":
          switch (parsedUrl.pathname) {
            case "/posts":
              getPosts(response);
              break;
            case `/posts/${id}`:
              if (id) {
                getPostById(id, response);
              } else {
                sendResponse(response, 400, { message: "Invalid ID" });
              }

              break;
            default:
              sendResponse(response, 404, { message: "Not found" });
          }
          break;
        case "PUT":
          if (parsedUrl.pathname && parsedUrl.pathname.startsWith("/posts/")) {
            if (id) {
              if (isMutatePost(request)) {
                updatePost(id, request, response);
              } else {
                sendResponse(response, 400, {
                  message: "Invalid request structure for updating a post",
                });
              }
            } else {
              sendResponse(response, 400, { message: "Invalid ID" });
            }
          } else {
            sendResponse(response, 404, { message: "Not Found" });
          }
          break;

        case "DELETE":
          if (parsedUrl.pathname && parsedUrl.pathname.startsWith("/posts/")) {
            if (id) {
              deletePost(id, response);
            } else {
              sendResponse(response, 400, { message: "Invalid ID" });
            }
          } else {
            sendResponse(response, 404, { message: "Not Found" });
          }
          break;

        default:
          console.log("Am I being sent?");
          sendResponse(response, 405, { message: "Method Not Allowed" });
      }
    });
  }
);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
