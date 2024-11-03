import path from "path";
import fs from "fs";
import { BlogPost } from "./types";
// import { BlogPosts } from "./types";

// const path = require("path");
// const fs = require("fs");

type RequestCount = {
  count: number;
  startTime: number;
};

type RequestCounts = {
  [ip: string]: RequestCount;
};

const requestCounts: RequestCounts = {};
const blacklistedTokens = new Set();

let __dirname = path.dirname(new URL(import.meta.url).pathname);
__dirname = path.win32.normalize(__dirname.substring(1));

const logDirectory = path.join(__dirname, "logs");
if (!fs.existsSync(logDirectory)) {
  fs.mkdirSync(logDirectory);
}

const logFilePath = path.join(logDirectory, "request_logs.txt");

const RATE_LIMIT_WINDOW = 60000; //60 seconds;
const MAX_REQUESTS = process.env.NODE_ENV === "production" ? 10 : 1000; //10 requests per min

const USERNAME = "username";
const PASSWORD = "password";

let blogPosts: BlogPost[] = [
  { id: "1", title: "First Post", content: "Hello World" },
];
// let blogPosts: BlogPost[] = [];

export {
  requestCounts,
  blacklistedTokens,
  logFilePath,
  RATE_LIMIT_WINDOW,
  MAX_REQUESTS,
  USERNAME,
  PASSWORD,
  blogPosts,
};

// module.exports = {
//   requestCounts,
//   blacklistedTokens,
//   logFilePath,
//   RATE_LIMIT_WINDOW,
//   MAX_REQUESTS,
//   USERNAME,
//   PASSWORD,
//   blogPosts,
// };
