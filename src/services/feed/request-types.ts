import type { Request } from "express";

export interface GetFeedRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    feedType?: string;
  };
} 