import { IncomingMessage, ServerResponse } from "http";
import {
  sendResponse,
  generateToken,
  verifyToken,
} from "../utilities/utils.js";
import { ExtendedRequest, LoginPostRequest } from "../types";

import { blacklistedTokens, USERNAME, PASSWORD } from "../globals.js";

function isLoginRequest(body: any): body is LoginPostRequest {
  return (
    body &&
    typeof body.username === "string" &&
    typeof body.password === "string"
  );
}

// function isCreatePostRequest(body: any): body is CreatePostRequest {
//   return (
//     body && typeof body.title === "string" && typeof body.content === "string"
//   );
// }

const login = (request: ExtendedRequest, response: ServerResponse) => {
  if (!isLoginRequest(request.body)) {
    sendResponse(response, 400, {
      message: "Invalid request format for login",
    });
    return;
  }
  const { username, password } = request.body;
  if (username === USERNAME && password === PASSWORD) {
    const token = generateToken({ username });
    sendResponse(response, 200, { message: "Login successful", token });
  } else {
    sendResponse(response, 401, { message: "Invalid credentials" });
  }
};

const logout = (request: IncomingMessage, response: ServerResponse) => {
  const authHeader = request.headers["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    sendResponse(response, 401, { message: "Unauthorized: No token provided" });
    return;
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    sendResponse(response, 401, { message: "Unauthorized: Token missing" });
    return;
  }
  if (!verifyToken(token) || blacklistedTokens.has(token)) {
    sendResponse(response, 403, { message: "Forbidden: Invalid token" });
    return;
  }
  //console.log("blackListedTokens INIT: ", blacklistedTokens);
  blacklistedTokens.add(token);
  //console.log("blackListedTokens FINAL: ", blacklistedTokens);
  sendResponse(response, 200, { message: "Logged out successfully" });
};
export { login, logout };
