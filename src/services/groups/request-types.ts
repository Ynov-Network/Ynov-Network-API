import type { Request } from 'express';
import type {
  GroupIdParams,
  CreateGroupBody,
  UpdateGroupBody,
} from './validations';

export interface GetGroupsRequest extends Request {
  query: {
    page: string;
    limit: string;
    topic: string;
    q: string;
  };
}

export interface GetGroupByIdRequest extends Request {
  params: GroupIdParams;
}

export interface CreateGroupRequest extends Request {
  body: CreateGroupBody;
}

export interface UpdateGroupRequest extends Request {
  params: GroupIdParams;
  body: UpdateGroupBody;
}

export interface DeleteGroupRequest extends Request {
  params: GroupIdParams;
}

export interface JoinOrLeaveGroupRequest extends Request {
  params: GroupIdParams;
} 