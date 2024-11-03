import { ServerResponse } from "http";
import { sendResponse } from "../utilities/utils.js";
import { blogPosts } from "../globals.js";
import { BlogPost, CreatePostRequest } from "../types.js";
const getPosts = (response: ServerResponse) => {
  sendResponse(response, 200, blogPosts);
};

const getPostById = (id: string, response: ServerResponse): void => {
  const post: BlogPost | undefined = blogPosts.find(
    (blogPost) => blogPost.id === id
  );
  if (!post) {
    sendResponse(response, 404, { message: "Post not found" });
    return;
  }
  sendResponse(response, 200, post);
};

const createPost = (
  request: CreatePostRequest,
  response: ServerResponse
): void => {
  const { title, content } = request.body;
  const blog = blogPosts[blogPosts.length - 1];
  let newId;

  if (blog !== null && blog?.id) {
    newId = (parseInt(blog.id) + 1).toString();
  } else {
    newId = "1";
  }

  // const newId = (
  //   blogPosts.length > 0 ? parseInt(blogPosts[blogPosts.length - 1].id) + 1 : 1
  // ).toString();

  const newPost: BlogPost = { id: newId, title, content };
  blogPosts.push(newPost);
  sendResponse(response, 201, newPost);
};

const updatePost = (
  id: string,
  request: CreatePostRequest,
  response: ServerResponse
) => {
  const postIndex = blogPosts.findIndex((post) => post.id === id);
  if (postIndex === -1) {
    sendResponse(response, 404, { message: "Post not found" });
    return;
  }

  try {
    const updates = request.body;
    const currentPost = blogPosts[postIndex];
    if (!currentPost) {
      sendResponse(response, 404, { message: "Post not found" });
      return;
    }
    const updatedPost: BlogPost = {
      ...currentPost,
      ...updates,
      id: currentPost.id,
    };
    blogPosts[postIndex] = updatedPost;
    sendResponse(response, 200, updatedPost);
  } catch (error) {
    sendResponse(response, 400, {
      message: "Invalid JSON",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

const deletePost = (id: string, response: ServerResponse) => {
  const postIndex = blogPosts.findIndex((post) => post.id === id);
  if (postIndex === -1) {
    sendResponse(response, 404, { message: "Post not found" });
    return;
  }
  blogPosts.splice(postIndex, 1);
  sendResponse(response, 204, { message: "" });
};

// module.exports = { getPosts, getPostById, createPost, updatePost, deletePost };

export { getPosts, getPostById, createPost, updatePost, deletePost };
