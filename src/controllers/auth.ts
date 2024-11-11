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
} from "../types";
import jwt, { JwtPayload } from "jsonwebtoken";
// import { blacklistedTokens } from "../globals.js";
import { users_pool } from "../database/pg_db.js";

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
  //Check if username already exists
  if (await usernameExists(username)) {
    sendResponse(response, 400, { message: "Username already exists." });
    return;
  }
  //Check if email already exists
  if (await emailExists(email)) {
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
  // sendResponse(response, 404, { message: "TEST" });
  // return;
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
const usernameExists = async (username: string) => {
  //SQL method for seeing if username exists
  const query = "SELECT 1 from users WHERE username = $1 LIMIT 1";

  try {
    const result = await users_pool.query(query, [username]);
    return result?.rowCount && result.rowCount > 0;
  } catch (error) {
    return false;
  }
};
const emailExists = async (email: string) => {
  //SQL method for seeing if email exists
  const query = "SELECT 1 from users WHERE email = $1 LIMIT 1";

  try {
    const result = await users_pool.query(query, [email]);
    return result?.rowCount && result.rowCount > 0;
  } catch (error) {
    return false;
  }
};

const addNewUser = async (
  username: string,
  password: string,
  email: string
) => {
  const query =
    "INSERT INTO users (username, password, email) VALUES ($1, $2, $3)";
  try {
    await users_pool.query(query, [username, password, email]);
  } catch (error) {
    throw new Error("Failed to add new user to the database.");
  }
  // console.log("username: ", username);
  // console.log("password: ", password);
  // console.log("email: ", email);
};
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
    sendResponse(response, 500, { message: "Internal Server Error" });
  }
};
export { login, logout, register };
