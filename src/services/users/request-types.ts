import type { Request } from 'express';
import type { 
  updateUserProfileSchema, 
  searchUsersQuerySchema 
} from './validations';
import type { z } from 'zod';

export interface GetUserProfileRequest extends Request { // Request if it's for the logged-in user
  params: {
    userId: string;
  };
}

export interface UpdateUserProfileRequest extends Request {
  body: z.infer<typeof updateUserProfileSchema>;
}

// For actions like follow/unfollow, targeting another user
export interface UserActionRequest extends Request {
  params: {
    targetUserId: string; // UUID string of the user to follow/unfollow
  };
}

export interface SearchUsersRequest extends Request {
  query: z.infer<typeof searchUsersQuerySchema>;
}
