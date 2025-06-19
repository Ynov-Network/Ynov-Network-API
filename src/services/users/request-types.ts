import type { Request } from "express";
import type {
  DeleteUserRequestBody,
  UpdatePrivacySettingsRequestBody,
  UpdateProfilePictureRequestBody,
  UpdateUserRequestBody,
  UserIdParams,
  UpdateNotificationSettingsRequestBody
} from "./validations";

export interface GetUserProfileRequest extends Request {
  params: UserIdParams;
}

export interface UpdateUserRequest extends Request {
  body: UpdateUserRequestBody;
}

export interface UpdateProfilePictureRequest extends Request {
  body: UpdateProfilePictureRequestBody;
}

export interface UpdatePrivacySettingsRequest extends Request {
  body: UpdatePrivacySettingsRequestBody;
}

export interface UpdateNotificationSettingsRequest extends Request {
  body: UpdateNotificationSettingsRequestBody;
}

export interface DeleteUserRequest extends Request {
  body: DeleteUserRequestBody;
}

export interface GetSuggestedUsersRequest extends Request {
  query: {
    limit?: string;
  };
}