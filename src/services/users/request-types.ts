import type { Request } from "express";
import type { DeleteUserRequestBody, UpdatePrivacySettingsRequestBody, UpdateProfilePictureRequestBody, UpdateUserRequestBody } from "./validations";

export interface GetUserProfileRequest extends Request {
  params: {
    userId?: string;
  };
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

export interface DeleteUserRequest extends Request {
  body: DeleteUserRequestBody;
}