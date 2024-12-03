import { IncomingMessage, ServerResponse } from "http";
import {
  checkTokenExpiration,
  sendResponse,
  verifyToken,
} from "./utilities/utils.js";

import {
  requestCounts,
  MAX_REQUESTS,
  RATE_LIMIT_WINDOW,
} from "./utilities/utils.js";

import { DecodedToken } from "../types/types";
import { getDbClient } from "./database/pg_db.js";

interface RequestCount {
  count: number;
  startTime: number;
}

const errorMiddleware = (
  _request: IncomingMessage,
  response: ServerResponse,
  next: () => void
) => {
  try {
    next();
  } catch (error) {
    let statusCode = 500;
    let errorMessage = { message: `Internal Server Error` };

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
  // fs.appendFile(logFilePath, logMessage + "\n", (err) => {
  //   if (err) {
  //     console.error("Failed to write to log file:", err);
  //   }
  // });
  next();
};

interface UserRequest extends IncomingMessage {
  user: DecodedToken;
}

const jwtAuthMiddleware = async (
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
    const isExpired = checkTokenExpiration(token);

    if (isExpired) {
      sendResponse(response, 401, { message: "Token expired" });
      return;
    }
    const client = getDbClient(); //added
    try {
      const result = await client.query(
        "SELECT * FROM user_tokens WHERE token = $1 AND blacklisted = TRUE",
        [token]
      );
      if (result.rows.length > 0) {
        sendResponse(response, 403, { message: "Token has been blacklisted." });
        return;
      }
    } catch (error) {
      console.error("Error checking blacklisted tokens:", error);
      sendResponse(response, 500, {
        message: `Internal Server Error: Error 1`,
      });
    } /*finally {
      await client.end();
    }*/
    //Fix this blacklisting
    // if (blacklistedTokens.has(token)) {
    //   sendResponse(response, 403, { message: "Token has been blacklisted" });
    //   return;
    // }
    const decoded = verifyToken(token);
    if (!decoded) {
      sendResponse(response, 403, { message: "Forbidden" });
      return;
    }
    request.user = decoded;
  }
  next();
};

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

const corsMiddleware2 = (
  request: IncomingMessage,
  response: ServerResponse,
  next: () => void
): void => {
  const allowedOrigin = "http://localhost:5173";
  response.setHeader("Access-Control-Allow-Origin", allowedOrigin);
  response.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  response.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization"
  );
  response.setHeader("Access-Control-Allow-Credentials", "true");

  if (request.method === "OPTIONS") {
    response.writeHead(204);
    response.end();
    return;
  }

  next();
};

export {
  errorMiddleware,
  rateLimitMiddleware,
  loggingMiddleware,
  jwtAuthMiddleware,
  corsMiddleware,
  corsMiddleware2,
};
