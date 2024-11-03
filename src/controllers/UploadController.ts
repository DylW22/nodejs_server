import { ServerResponse } from "http";
import fs from "fs";
import path from "path";
import { sendResponse } from "../utilities/utils.js";
import { UploadFile } from "../types";

const uploadFile = (request: UploadFile, response: ServerResponse) => {
  const uploadDir = path.join("src/uploads");
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
  }

  const filePath = path.join(uploadDir, request.file.name);
  fs.writeFile(filePath, request.file.data, (err) => {
    if (err) {
      return sendResponse(response, 500, { message: "Failed to save file" });
    }

    sendResponse(response, 200, {
      message: "File uploaded successfully",
      file: {
        name: request.file.name,
        path: filePath,
      },
    });
  });
};

export { uploadFile };
