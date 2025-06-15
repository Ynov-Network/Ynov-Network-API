import type { Request } from 'express';
import type { CreatePostRequestBody, PostIdParams, UpdatePostRequestBody, UserIdParams } from './validations';

export interface CreatePostRequest extends Request {
  body: CreatePostRequestBody;
}

export interface UpdatePostRequest extends Request {
  params: PostIdParams;
  body: UpdatePostRequestBody;
}

export interface DeletePostRequest extends Request {
  params: PostIdParams;
}

export interface GetPostRequest extends Request {
  params: PostIdParams;
}

export interface GetPostsByUserRequest extends Request {
  params: UserIdParams;
  query: {
    page?: string;
    limit?: string;
  }
}