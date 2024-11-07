import { IncomingMessage, ServerResponse } from "http";
import {
  sendResponse,
  generateToken,
  verifyToken,
} from "../utilities/utils.js";
import { ExtendedRequest, LoginPostRequest } from "../types";
import jwt, { JwtPayload } from "jsonwebtoken";
// import { blacklistedTokens } from "../globals.js";
import { users_pool } from "../database/pg_dbOG.js";

function isLoginRequest(body: any): body is LoginPostRequest {
  return (
    body &&
    typeof body.username === "string" &&
    typeof body.password === "string"
  );
}

const login = async (request: ExtendedRequest, response: ServerResponse) => {
  if (!isLoginRequest(request.body)) {
    sendResponse(response, 400, {
      message: "Invalid request format for login",
    });
    return;
  }
  const { username, password } = request.body;

  try {
    const result = await users_pool.query(
      "SELECT * FROM users WHERE username = $1",
      [username]
    );
    if (result.rowCount === 0) {
      sendResponse(response, 401, { message: "Invalid credentials" });
      return;
    }
    const user = result.rows[0];
    const isMatch = password === user.password; //Perform decryption here
    if (isMatch) {
      const token = generateToken(user.id);

      const decoded = jwt.decode(token) as JwtPayload;
      if (!decoded?.exp) {
        throw new Error("Token does not contain an expiration");
      }
      sendResponse(response, 200, { message: "Login successful", token });
      //Added
      const expiresAt = new Date(decoded.exp * 1000);
      await users_pool.query(
        "INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, token, expiresAt]
      );
    } else {
      sendResponse(response, 401, { message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    sendResponse(response, 500, { message: "Internal server error" });
  }
};

const logout = async (request: IncomingMessage, response: ServerResponse) => {
  //Currently using in-memory blacklist.
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
  if (!verifyToken(token)) {
    //blacklistedTokens.has(token)
    sendResponse(response, 403, { message: "Forbidden: Invalid token" });
    return;
  }
  // blacklistedTokens.add(token);
  try {
    await users_pool.query(
      "UPDATE user_tokens SET blacklisted = TRUE WHERE token = $1",
      [token]
    );
    sendResponse(response, 200, { message: "Logged out successfully" });
  } catch (error) {
    console.error("Error blacklisting token:", error);
    sendResponse(response, 500, { message: "Internal Server Error Test 6" });
  }
};
export { login, logout };
