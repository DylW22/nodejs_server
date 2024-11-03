import { IncomingMessage, ServerResponse } from "http";
import { sendResponse, verifyToken } from "./utilities/utils.js";

import {
  requestCounts,
  logFilePath,
  blacklistedTokens,
  RATE_LIMIT_WINDOW,
  MAX_REQUESTS,
} from "./globals.js";

import fs from "fs";
import { DecodedToken, ExtendedRequest } from "./types.js";
//import { isUploadFile } from "./server.js";

interface RequestCount {
  count: number;
  startTime: number;
}

//https://chatgpt.com/c/6724597f-0440-8012-a584-3d17b6d18b25
const errorMiddleware = (
  _request: IncomingMessage,
  response: ServerResponse,
  next: () => void
) => {
  try {
    next();
  } catch (error) {
    let statusCode = 500;
    let errorMessage = { message: "Internal Server Error" };

    if (error instanceof Error) {
      statusCode = (error as any).statusCode || 500;
      errorMessage = { message: error.message };
    }
    sendResponse(response, statusCode, errorMessage);
  }
};

const rateLimitMiddleware = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => {}
) => {
  const ip = request.socket.remoteAddress || "";
  const now = Date.now();

  if (!requestCounts[ip]) {
    requestCounts[ip] = { count: 1, startTime: now };
  } else {
    const requestCount = requestCounts[ip] as RequestCount;
    // if (!requestCounts[ip]?.startTime) return; //test
    const elapsedTime = now - requestCount.startTime;
    if (elapsedTime < RATE_LIMIT_WINDOW) {
      if (requestCount.count >= MAX_REQUESTS) {
        sendResponse(response, 429, {
          message: "Too many requests - try again later",
        });
        return;
      } else {
        requestCount.count += 1;
      }
    } else {
      requestCounts[ip] = { count: 1, startTime: now };
    }
  }
  next();
};

const loggingMiddleware = (
  request: IncomingMessage,
  _response: ServerResponse,
  next: () => {}
) => {
  const { method, url } = request;
  const now = new Date();
  const timestamp = now.toLocaleString("en-AU", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false, // for 24-hour format
  });

  const ip = request.socket.remoteAddress;
  const logMessage = `[${timestamp}] ${method} ${url} ip: ${ip}`;

  console.log(logMessage);
  fs.appendFile(logFilePath, logMessage + "\n", (err) => {
    if (err) {
      console.error("Failed to write to log file:", err);
    }
  });
  next();
};

interface UserRequest extends IncomingMessage {
  user: DecodedToken;
}

const jwtAuthMiddleware = (
  request: UserRequest,
  response: ServerResponse,
  next: () => {}
) => {
  if (["POST", "PUT", "DELETE"].includes(request.method || "")) {
    const authHeader = request.headers["authorization"] as string | undefined;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      sendResponse(response, 401, { message: "Unauthorized" });
      return;
    }

    const token = authHeader.split(" ")[1] || "";

    if (blacklistedTokens.has(token)) {
      sendResponse(response, 403, { message: "Token has been blacklisted" });
      return;
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      sendResponse(response, 403, { message: "Forbidden" });
      return;
    }
    request.user = decoded;
  }
  next();
};

const jsonParsingMiddleware = (
  request: ExtendedRequest,
  response: ServerResponse,
  next: () => {}
) => {
  if (request.method === "POST" || request.method === "PUT") {
    const contentType = request.headers["content-type"] as string;

    if (contentType.includes("application/json")) {
      //handle json
      let body = "";
      request.on("data", (chunk: Buffer) => {
        body += chunk.toString();
      });
      request.on("end", () => {
        try {
          request.body = JSON.parse(body);
          next();
        } catch (error) {
          sendResponse(response, 400, {
            message: "Invalid JSON",
            error:
              error instanceof Error ? error.message : "Internal Server Error",
          });
        }
      });
      request.on("error", () => {
        sendResponse(response, 500, { message: "Internal Server Error" });
      });
    } else if (contentType?.includes("multipart/form-data")) {
      //handle multi-form
      const boundary = contentType.split("boundary=")[1];
      if (!boundary) {
        sendResponse(response, 400, { message: "No boundary specified" });
        return;
      }
      let body = Buffer.alloc(0);

      request.on("data", (chunk: Buffer) => {
        body = Buffer.concat([body, chunk]);
      });

      request.on("end", () => {
        const parts = body.toString().split(`--${boundary}`);
        const filePart = parts.find((part) =>
          part.includes("Content-Disposition: form-data")
        );
        if (filePart) {
          const [headers, fileContent] = filePart.split("\r\n\r\n");

          if (!headers?.length || !fileContent?.length) {
            sendResponse(response, 400, {
              message: "Invalid file upload format",
            });
            return;
          }

          const fileNameMatch = headers.match(/filename="(.+?)"/);
          const fileName = fileNameMatch ? fileNameMatch[1] : "uploaded_file";

          request.file = {
            name: `${fileName}`, //fileName
            data: Buffer.from(
              fileContent.split("\r\n--")[0] as string,
              "binary"
            ),
          };
          next();
        } else {
          sendResponse(response, 400, {
            message: "No file uploaded",
          });
        }
      });
      request.on("error", () => {
        sendResponse(response, 500, {
          message: "Internal Server Error during file upload",
        });
      });
    } else {
      sendResponse(response, 415, { message: "Unsupported Content-Type" });
    }
  } else {
    next();
  }
};

export {
  errorMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
  jwtAuthMiddleware,
  jsonParsingMiddleware,
};
