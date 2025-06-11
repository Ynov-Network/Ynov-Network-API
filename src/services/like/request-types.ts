import type { Request } from 'express';
import type { PostIdParams } from './validations';

export interface ToggleLikeRequest extends Request {
  params: PostIdParams
}

export interface GetLikesForPostRequest extends Request {
  params: PostIdParams;
  query: {
    page?: string;
    limit?: string;
  };
}