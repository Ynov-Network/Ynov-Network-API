import type { Request } from 'express';
import type { TagNameParams } from './validations';

// For GET /hashtags
export interface GetHashtagsRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    sortBy?: string;
  }
};

// For GET /hashtags/:tagName
export interface GetPostsByHashtagRequest extends Request {
  params: TagNameParams;
  query: {
    page?: string;
    limit?: string;
  }
};