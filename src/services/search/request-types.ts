import type { Request } from 'express';

export interface SearchRequest extends Request {
  query: {
    q: string;
    page: string;
    limit: string;
    type: string;
  };
}