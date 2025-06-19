import type { Request } from "express";
import type { SignInRequestBody, SignInSocialRequestBody, SignUpRequestBody } from "./validation";

export interface SignUpRequest extends Request {
  body: SignUpRequestBody;
}

export interface SignInRequest extends Request {
  body: SignInRequestBody
}

export interface SignInSocialRequest extends Request {
  body: SignInSocialRequestBody;
}