import type { Request } from 'express';
import type { UserIdParamSchema } from "./validations";

export interface FollowRequest extends Request {
  params: UserIdParamSchema;
}

export interface GetFollowsRequest extends Request {
  params: UserIdParamSchema;
  query: {
    page?: string;
    limit?: string;
  }
}