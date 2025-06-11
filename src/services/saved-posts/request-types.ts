import type { Request } from "express";
import type { PostIdParams } from "./validations";

export interface SavePostRequest extends Request {
  params: PostIdParams
};

export interface GetSavedPostsRequest extends Request {
  query: {
    page: string;
    limit: string;
  }
};