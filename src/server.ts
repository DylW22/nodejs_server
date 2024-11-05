export default function handler(req: any, res: any) {
  const { method, url } = req;

  // Routing based on the URL path
  if (url === "/posts") {
    switch (method) {
      case "GET":
        // Logic to retrieve posts
        const posts = [
          { id: 1, title: "First Post", content: "This is the first post." },
          { id: 2, title: "Second Post", content: "This is the second post." },
        ];
        return res.status(200).json(posts);

      case "POST":
        // Logic to create a new post
        const newPost = req.body; // Assuming the post data is sent in the request body
        return res
          .status(201)
          .json({ message: "Post created!", post: newPost });

      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  } else {
    // Handle other requests (like the root endpoint)
    switch (method) {
      case "GET":
        // Logic for the root API endpoint
        return res.status(200).json({ message: `Welcome to the API!` });
      default:
        res.setHeader("Allow", ["GET"]);
        return res.status(405).end(`Method ${method} Not Allowed`);
    }
  }
}

/*import http, { IncomingMessage, ServerResponse } from "node:http";
import url from "url";
import dotenv from "dotenv";
dotenv.config();

import {
  sendResponse,
  runMiddleware,
  refreshTokenBlacklist,
  isUploadFile,
  isMutatePost,
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

// CORS middleware function
const corsMiddleware = (req: IncomingMessage, res: ServerResponse) => {
  // Allow all origins (for development; change for production)
  res.setHeader("Access-Control-Allow-Origin", "*");

  // Allow specific HTTP methods
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );

  // Allow specific headers (if needed)
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    res.writeHead(204); // No Content
    res.end();
    return true; // Indicate that we handled the request
  }

  return false; // Indicate that the request should continue to be handled
};

const server = http.createServer(
  //request: IncomingMessage
  (request: IncomingMessage, response: ServerResponse) => {
    const corsHandled = corsMiddleware(request, response);
    if (corsHandled) return; // If CORS handled, return early

    const parsedUrl = url.parse(request.url || "", true);
    //Added this
    let normalizedPathname = parsedUrl.pathname || "";
    if (normalizedPathname.endsWith("/")) {
      normalizedPathname = normalizedPathname.slice(0, -1);
    }
    // console.log("parsedUrl: ", parsedUrl);
    // console.log("normalized: ", normalizedPathname);
    const method = request.method;
    //const id = parsedUrl.pathname ? parsedUrl.pathname.split("/")[2] : null; // Extract ID from URL
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
              sendResponse(response, 404, { message: "Not found Test A" });
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
              sendResponse(response, 404, {
                message: `Not found ${normalizedPathname}`,
              });
          }
          break;
        case "PUT":
          if (normalizedPathname.startsWith("/posts/")) {
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
            sendResponse(response, 404, { message: "Not Found Test C" });
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
            sendResponse(response, 404, { message: "Not Found Test D" });
          }
          break;

        default:
          sendResponse(response, 405, { message: "Method Not Allowed" });
      }
    });
  }
);

server.listen(port, hostname, () => {
  console.log(`Server running at http://${hostname}:${port}/`);
});
*/
