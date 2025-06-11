import type { Request } from 'express';
import type {
  CreateCommentRequestBody,
  UpdateCommentRequestBody,
  PostIdParams,
  CommentIdParams
} from './validations';

export interface CreateCommentRequest extends Request {
  params: PostIdParams;
  body: CreateCommentRequestBody;
}

export interface GetCommentsByPostRequest extends Request {
  params: PostIdParams;
  query: {
    page?: string;
    limit?: string;
  }
};

export interface UpdateCommentRequest extends Request {
  params: CommentIdParams;
  body: UpdateCommentRequestBody;
}

export interface DeleteCommentRequest extends Request {
  params: CommentIdParams;
} 