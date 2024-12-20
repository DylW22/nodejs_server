import { IncomingMessage, ServerResponse } from "http";
import {
  sendResponse,
  generateToken,
  verifyToken,
} from "../utilities/utils.js";
import {
  ExtendedRequest,
  LoginPostRequest,
  RegisterPostRequest,
} from "../../types/types.js";
import jwt, { JwtPayload } from "jsonwebtoken";
import { getDbClient } from "../database/pg_db.js";
function isLoginRequest(body: any): body is LoginPostRequest {
  return (
    body &&
    typeof body.username === "string" &&
    typeof body.password === "string"
  );
}

function isRegisterRequest(body: any): body is RegisterPostRequest {
  return (
    body &&
    typeof body.username === "string" &&
    typeof body.password === "string" &&
    typeof body.confirmPassword === "string" &&
    typeof body.email === "string"
  );
}

const register = async (request: ExtendedRequest, response: ServerResponse) => {
  if (!isRegisterRequest(request.body)) {
    sendResponse(response, 400, {
      message: "Invalid request format for registration",
    });
    return;
  }

  const { username, password, confirmPassword, email } = request.body;
  //Perform input validation here.
  //Perform sanitisation here.

  //Check if passwords match
  if (!passwordsMatch(password, confirmPassword)) {
    sendResponse(response, 400, { message: "Passwords do not match." });
    return;
  }

  //Check if username is of valid type (min length, etc)
  if (!isValidUsername(username)) {
    sendResponse(response, 400, { message: "Invalid username." });
    return;
  }
  //Check if email is of valid type (structure)
  if (!isValidEmail(email)) {
    sendResponse(response, 400, { message: "Invalid email address." });
    return;
  }
  //Check is password is of valid type (min length, etc)
  if (!isValidPassword(password)) {
    sendResponse(response, 400, { message: "Password is invalid." });
    return;
  }
  const user = await userExists(username, email);
  if (user && user?.username === username) {
    sendResponse(response, 400, { message: "Username already exists." });
    return;
  } else if (user && user?.email === email) {
    sendResponse(response, 400, { message: "Email address already exists." });
    return;
  }

  try {
    //Encrypt password here
    await addNewUser(username, password, email);
    sendResponse(response, 201, { message: "User registered successfully." });
  } catch (error) {
    console.error("Error registering user: ", error);
    sendResponse(response, 500, {
      message: `An error occurred while registering the user: ${error}`,
    });
  }
};

const passwordsMatch = (password: string, confirmPassword: string) => {
  if (!password || !confirmPassword) {
    return false;
  }
  return password === confirmPassword;
};
type UsernamePattern = string & { __usernameBrand: never };
const isValidUsername = (username: string): username is UsernamePattern => {
  const usernamePattern = /^[a-zA-Z0-9]{6,}$/;
  return usernamePattern.test(username);
};

type EmailPattern = `${string}@${string}.com${string | null}`;
const isValidEmail = (email: string): email is EmailPattern => {
  const emailPattern = /^[^\s@]+@[^\s@]+\.com$/;
  return emailPattern.test(email);
};
type PasswordPattern = string & { __passwordBrand: never };
const isValidPassword = (password: string): password is PasswordPattern => {
  // Regex for password: at least 8 characters, one uppercase, one lowercase, one digit, and no special characters
  //const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d]{8,}$/;

  const passwordPattern = /^.{8,}$/;
  return passwordPattern.test(password);
};

//const isCommonPassword = () => {};

const userExists = async (username: string, email: string) => {
  const query =
    "SELECT username, email from users WHERE username = $1 OR email = $2 LIMIT 1";
  const client = getDbClient();
  try {
    //await client.connect();
    const result = await client.query(query, [username, email]);
    return result.rows[0];
  } catch (error) {
    return false;
  } /*finally {
    await client.end();
  }*/
};

const addNewUser = async (
  username: string,
  password: string,
  email: string
) => {
  const query =
    "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)";
  const client = getDbClient();
  try {
    await client.query(query, [username, password, email]);
  } catch (error) {
    throw new Error("Failed to add new user to the database.");
  } /*finally {
    await client.end();
  }*/
};
const login = async (request: ExtendedRequest, response: ServerResponse) => {
  if (!isLoginRequest(request.body)) {
    sendResponse(response, 400, {
      message: "Invalid request format for login",
    });
    return;
  }
  const { username, password } = request.body;
  const client = getDbClient();
  try {
    const result = await client.query(
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

      const expiresAt = new Date(decoded.exp * 1000);

      await client.query(
        "INSERT INTO user_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
        [user.id, token, expiresAt]
      );
      sendResponse(response, 200, { message: "Login successful", token });
    } else {
      sendResponse(response, 401, { message: "Invalid credentials" });
    }
  } catch (error) {
    console.error("Error during login:", error);
    sendResponse(response, 500, { message: "Internal server error: Error 2" });
  } /*finally {
    await client.end();
  }*/
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
  const client = getDbClient();
  try {
    await client.query(
      "UPDATE user_tokens SET blacklisted = TRUE WHERE token = $1",
      [token]
    );
    sendResponse(response, 200, { message: "Logged out successfully" });
  } catch (error) {
    console.error("Error blacklisting token:", error);
    sendResponse(response, 500, { message: "Internal Server Error: Error 3" });
  } /*finally {
    await client.end();
  }*/
};
export { login, logout, register };
