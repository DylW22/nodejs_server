import { IncomingMessage, ServerResponse } from "http";

import jwt, { JwtPayload } from "jsonwebtoken";
import {
  BlogPost,
  CreatePostRequest,
  DecodedToken,
  RequestCounts,
  UploadFile,
} from "../../types/types";

const { JWT_SECRET, JWT_EXPIRATION } = process.env;

const RATE_LIMIT_WINDOW = 1000; //60 seconds;
const MAX_REQUESTS = process.env.NODE_ENV === "production" ? 10 : 1000; //10 requests per min
const requestCounts: RequestCounts = {};

const generateToken = (userId: string): string => {
  const token = jwt.sign({ userId: userId }, JWT_SECRET as jwt.Secret, {
    expiresIn: JWT_EXPIRATION,
  });

  return token;
};

const verifyToken = (token: string): DecodedToken | null => {
  try {
    return jwt.verify(token, JWT_SECRET as jwt.Secret) as DecodedToken;
  } catch (error) {
    return null;
  }
};

export const checkTokenExpiration = (token: string) => {
  try {
    const decoded = jwt.decode(token) as JwtPayload;
    if (!decoded || !decoded.exp) return true;
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error("Error decoding token", error);
    return true;
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

const isUploadFile = (request: IncomingMessage): request is UploadFile => {
  return (request as UploadFile).file !== undefined;
};

const isMutatePost = (
  request: IncomingMessage
): request is CreatePostRequest => {
  return (request as CreatePostRequest).body !== undefined;
};

export {
  generateToken,
  verifyToken,
  sendResponse,
  runMiddleware,
  refreshTokenBlacklist,
  isUploadFile,
  isMutatePost,
  MAX_REQUESTS,
  requestCounts,
  RATE_LIMIT_WINDOW,
};
