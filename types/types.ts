import { ServerResponse, IncomingMessage } from "http";
export interface BlogPost {
  id: string;
  title: string;
  content: string;
}

export type SendResponse = {
  response: ServerResponse;
  statusCode: number;
  data: BlogPost[];
};

export type getPostByIdProps = {
  id: string;
  response: ServerResponse;
};

//Old:
export interface CreatePostRequest extends IncomingMessage {
  body: {
    title: string;
    content: string;
  };
}

export interface LoginPostRequest extends IncomingMessage {
  username: string;
  password: string;
}

export interface RegisterPostRequest extends IncomingMessage {
  username: string;
  password: string;
  confirmPassword: string;
  email: string;
}

export interface UploadFile extends IncomingMessage {
  file: UploadFileStructure;
}

export interface createPostProps {
  request: CreatePostRequest;
  response: ServerResponse;
}

export interface updatePostProps extends createPostProps {
  id: string;
}

export type deletePostType = {
  id: string;
  response: ServerResponse;
};

export interface DecodedToken {
  username: string;
  iat: number; // issued at timestamp
  exp: number; // expiration timestamp
}

type UploadFileStructure = {
  name: string;
  data: Buffer;
};

export interface ExtendedRequest extends IncomingMessage {
  body?: CreatePostRequest | LoginPostRequest;
  file?: UploadFileStructure;
  user?: DecodedToken;
}

export type RequestCount = {
  count: number;
  startTime: number;
};

export type RequestCounts = {
  [ip: string]: RequestCount;
};
