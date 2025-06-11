import type { Request } from 'express';
import type { CreatePostRequestBody, PostIdParams, UpdatePostRequestBody } from './validations';

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