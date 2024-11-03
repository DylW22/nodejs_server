import { IncomingMessage, ServerResponse } from "http";
// const jwt = require("jsonwebtoken"); // Ensure you have the jwt package
// const { requestCounts, RATE_LIMIT_WINDOW } = require("../globals");

import jwt from "jsonwebtoken";
import { requestCounts, RATE_LIMIT_WINDOW } from "../globals.js";
import { BlogPost, DecodedToken } from "../types.js";
const { JWT_SECRET, JWT_EXPIRATION } = process.env;

interface User {
  username: string;
}

const generateToken = (user: User): string => {
  return jwt.sign({ username: user.username }, JWT_SECRET as jwt.Secret, {
    expiresIn: JWT_EXPIRATION,
  });
};

const verifyToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as DecodedToken;
  } catch (error) {
    return null;
  }
};

type Message = {
  message: string;
  error?: string;
  file?: {
    name: string;
    path: string;
  };
  token?: string;
};

const sendResponse = (
  response: ServerResponse,
  statusCode: number,
  data: Message | BlogPost | BlogPost[]
) => {
  response.writeHead(statusCode, { "Content-Type": "application/json" });
  response.end(JSON.stringify(data));
};

type Middleware = (
  req: IncomingMessage,
  res: ServerResponse,
  next: () => void
) => void;

const runMiddleware = (
  request: IncomingMessage,
  response: ServerResponse,
  middlewares: Middleware[] | any,
  finalHandler: () => void
): void => {
  let index = 0;
  const next = () => {
    if (index < middlewares.length) {
      const middleware = middlewares[index];
      if (typeof middleware !== "function") {
        throw new Error(`Middleware at index ${index} is not a function`);
      }
      index++;
      middleware(request, response, next);
    } else {
      finalHandler();
    }
  };
  next();
};

const refreshTokenBlacklist = () => {
  const now = Date.now();
  for (const [ip, data] of Object.entries(requestCounts)) {
    const elapsedTime = now - data.startTime;
    if (elapsedTime > RATE_LIMIT_WINDOW) {
      delete requestCounts[ip];
    }
  }
};

export {
  generateToken,
  verifyToken,
  sendResponse,
  runMiddleware,
  refreshTokenBlacklist,
};
