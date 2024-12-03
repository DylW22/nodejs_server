import { ServerResponse } from "http";
import { sendResponse } from "../utilities/utils.js";
import { CreatePostRequest } from "../../types/types.js";
import { getDbClient } from "../database/pg_db.js";
const getPosts = async (response: ServerResponse) => {
  const client = getDbClient();
  try {
    const results = await client.query('SELECT * FROM "BlogPosts"');
    const blogs = results.rows;
    //console.log(`${JSON.stringify(results.rows)}`);
    sendResponse(response, 200, blogs);
  } catch (error) {
    console.error("Error retrieving blog posts:", error);
    sendResponse(response, 500, {
      message: `Internal Server Error: Error 4, ${error}`,
    });
  } /*finally {
    await client.end();
  }*/
};

const getPostById = async (
  id: string,
  response: ServerResponse
): Promise<void> => {
  const client = getDbClient();
  try {
    const results = await client.query(
      `SELECT * FROM "BlogPosts" WHERE id = $1`,
      [id]
    );

    const retrievedPost = results.rows[0];
    if (!retrievedPost) {
      sendResponse(response, 404, { message: "Post not found" });
      return;
    }
    sendResponse(response, 200, retrievedPost);
  } catch (error) {
    console.error("Error retrieving blog posts:", error);
    sendResponse(response, 500, {
      message: `Internal Server Error: Error 5, ${error}`,
    });
  } /*finally {
    await client.end();
  }*/
};

const createPost = async (
  request: CreatePostRequest,
  response: ServerResponse
): Promise<void> => {
  const { title, content } = request.body;
  if (!title || !content) {
    sendResponse(response, 400, { message: "Title and content are required" });
    return;
  }
  const client = getDbClient();
  try {
    const result = await client.query(
      `INSERT INTO "BlogPosts" (title, content) VALUES ($1, $2) RETURNING *`,
      [title, content]
    );
    const newPost = result.rows[0];
    sendResponse(response, 201, newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    sendResponse(response, 500, { message: "Internal server error, Error A" });
  } /*finally {
    await client.end();
  }*/
};

const updatePost = async (
  id: string,
  request: CreatePostRequest,
  response: ServerResponse
) => {
  const client = getDbClient();
  try {
    const { title, content } = request.body;
    const result = await client.query(
      `UPDATE "BlogPosts" SET title = $1, content = $2 WHERE id = $3 RETURNING *`,
      [title, content, id]
    );
    if (result.rowCount === 0) {
      sendResponse(response, 404, { message: "Post not found" });
      return;
    }
    const updatedPost = result.rows[0];
    sendResponse(response, 200, updatedPost);
  } catch (error) {
    console.error("Error updating post: ", error);
    sendResponse(response, 400, {
      message: "Invalid request or database database error",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  } /*finally {
    await client.end();
  }*/
};

const deletePost = async (id: string, response: ServerResponse) => {
  const client = getDbClient();
  try {
    const result = await client.query(
      `DELETE FROM "BlogPosts" WHERE id = $1 RETURNING * `,
      [id]
    );
    if (result.rowCount === 0) {
      sendResponse(response, 404, { message: "Post not found" });
      return;
    }
    sendResponse(response, 204, { message: "" });
  } catch (error) {
    console.error("Error deleting post:", error);
    sendResponse(response, 500, { message: "Internal Server Error" });
  } /*finally {
    await client.end();
  }*/
};

export { getPosts, getPostById, createPost, updatePost, deletePost };
