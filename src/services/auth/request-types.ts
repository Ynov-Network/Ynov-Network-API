import type { Request } from "express";
import type { SignInRequestBody, SignUpRequestBody } from "./validation";

export interface SignUpRequest extends Request {
  body: SignUpRequestBody;
}

export interface SignInRequest extends Request {
  body: SignInRequestBody
}