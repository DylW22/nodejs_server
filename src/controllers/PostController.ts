import { ServerResponse } from "http";
import { sendResponse } from "../utilities/utils.js";
import { CreatePostRequest } from "../types.js";
import { pool } from "../database/pg_dbOG.js";

const getPosts = async (response: ServerResponse) => {
  try {
    const results = await pool.query("SELECT * FROM blog_posts");
    const blogs = results.rows;
    sendResponse(response, 200, blogs);
  } catch (error) {
    console.error("Error retrieving blog posts:", error);
    sendResponse(response, 500, { message: "Internal Server Error" });
  }
};

const getPostById = async (
  id: string,
  response: ServerResponse
): Promise<void> => {
  try {
    // if (process.env.NODE_ENV === "development") {
    //   await pool.query(
    //     "INSERT INTO blog_posts (id, title, content) VALUES (1, 'TEST_POST', 'This is a test post.');"
    //   );
    // }

    const results = await pool.query(`SELECT * FROM blog_posts WHERE id = $1`, [
      id,
    ]);

    const retrievedPost = results.rows[0];
    if (!retrievedPost) {
      sendResponse(response, 404, { message: "Post not found" });
      return;
    }
    sendResponse(response, 200, retrievedPost);
  } catch (error) {
    console.error("Error retrieving blog posts:", error);
    sendResponse(response, 500, { message: "Internal Server Error" });
  }
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

  try {
    // const connection = await setupDatabaseConnection();
    // if (!connection?.pool) {
    //   throw new Error("Database connection failed, pool is not available.");
    // }
    // const { pool } = connection;
    const result = await pool.query(
      "INSERT INTO blog_posts (title, content) VALUES ($1, $2) RETURNING *",
      [title, content]
    );
    const newPost = result.rows[0];
    sendResponse(response, 201, newPost);
  } catch (error) {
    console.error("Error creating post:", error);
    sendResponse(response, 500, { message: "Internal server error" });
  }
};

const updatePost = async (
  id: string,
  request: CreatePostRequest,
  response: ServerResponse
) => {
  try {
    const { title, content } = request.body;
    const result = await pool.query(
      `UPDATE blog_posts SET title = $1, content = $2 WHERE id = $3 RETURNING *`,
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
  }
};

const deletePost = async (id: string, response: ServerResponse) => {
  try {
    const result = await pool.query(
      "DELETE FROM blog_posts WHERE id = $1 RETURNING * ",
      [id]
    );
    console.log("result: ", result);
    if (result.rowCount === 0) {
      sendResponse(response, 404, { message: "Post not found" });
      return;
    }
    sendResponse(response, 204, { message: "" });
  } catch (error) {
    console.error("Error deleting post:", error);
    sendResponse(response, 500, { message: "Internal Server Error" });
  }
};

// const deletePost = (id: string, response: ServerResponse) => {
//   const postIndex = blogPosts.findIndex((post) => post.id === id);
//   if (postIndex === -1) {
//     sendResponse(response, 404, { message: "Post not found" });
//     return;
//   }
//   blogPosts.splice(postIndex, 1);
//   sendResponse(response, 204, { message: "" });
// };

// module.exports = { getPosts, getPostById, createPost, updatePost, deletePost };

export { getPosts, getPostById, createPost, updatePost, deletePost };
