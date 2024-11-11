import { IncomingMessage, ServerResponse } from "node:http";
import url from "url";
import dotenv from "dotenv";
dotenv.config();

import {
  sendResponse,
  runMiddleware,
  refreshTokenBlacklist,
  isUploadFile,
  isMutatePost,
  // isUploadFile,
  // isMutatePost,
} from "./utilities/utils.js";

import {
  errorMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
  jwtAuthMiddleware,
  jsonParsingMiddleware,
} from "./middlewares.js";

import { RATE_LIMIT_WINDOW } from "./globals.js";

// import { hostname, port } from "./config.js";

import { login, logout, register } from "./controllers/auth.js";
import {
  getPosts,
  getPostById,
  createPost,
  deletePost,
  updatePost,
} from "./controllers/PostController.js";

import { uploadFile } from "./controllers/UploadController.js";

const corsMiddleware = (req: IncomingMessage, res: ServerResponse) => {
  // Allow all origins (for development; change for production)
  res.setHeader("Access-Control-Allow-Origin", "*");

  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return true;
  }

  return false;
};

setInterval(refreshTokenBlacklist, RATE_LIMIT_WINDOW);

export default async function handler(
  request: IncomingMessage,
  response: ServerResponse
) {
  const corsHandled = corsMiddleware(request, response);
  if (corsHandled) return;

  const parsedUrl = url.parse(request.url || "", true);

  let normalizedPathname = parsedUrl.pathname || "";
  if (normalizedPathname.endsWith("/")) {
    normalizedPathname = normalizedPathname.slice(0, -1);
  }
  const method = request.method;

  const id = normalizedPathname.split("/")[2] || null;

  const middlewares = [
    rateLimitMiddleware,
    loggingMiddleware,
    errorMiddleware,
    jsonParsingMiddleware,
    ...(normalizedPathname.startsWith("/posts") ? [jwtAuthMiddleware] : []),
  ];
  runMiddleware(request, response, middlewares, () => {
    switch (method) {
      case "POST":
        switch (
          normalizedPathname //from parsedUrl.pathname
        ) {
          case "/upload":
            if (isUploadFile(request)) {
              //sendResponse(response, 200, { message: "/upload" });
              uploadFile(request, response);
            } else {
              sendResponse(response, 400, {
                message: "Invalid request type for upload",
              });
            }

            break;
          case "/login":
            //sendResponse(response, 200, { message: "/login" });
            login(request, response);
            break;
          case "/logout":
            //sendResponse(response, 200, { message: "/logout" });
            logout(request, response);
            break;
          case "/register":
            register(request, response);
            break;
          case "/posts":
            if (isMutatePost(request)) {
              //sendResponse(response, 200, { message: "POST /posts" });
              createPost(request, response);
            } else {
              console.log("Error 2");
              sendResponse(response, 400, {
                message: "Invalid request type for createPost",
              });
            }

            break;
          default:
            sendResponse(response, 404, { message: "Path not found" });
        }
        break;

      case "GET":
        switch (normalizedPathname) {
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
          //Test
          default:
            sendResponse(response, 200, {
              message: `Welcome to the API!`,
            });
        }
        break;
      case "PUT":
        if (normalizedPathname.startsWith("/posts/")) {
          //Normalize this
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
          sendResponse(response, 404, { message: "Post not found" });
        }
        break;
      case "DELETE":
        if (normalizedPathname.startsWith("/posts/")) {
          if (id) {
            deletePost(id, response);
          } else {
            sendResponse(response, 400, { message: "Invalid ID" });
          }
        } else {
          sendResponse(response, 404, { message: "Post not found" });
        }
        break;

      default:
        sendResponse(response, 404, {
          message: "Path not found",
        });
    }
  });
}
