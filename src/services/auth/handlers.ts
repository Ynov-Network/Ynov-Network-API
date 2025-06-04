import type { Response } from "express";
import type { SignInRequest, SignUpRequest } from "./request-types";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";

export const signUp = async (req: SignUpRequest, res: Response) => {
  try {
    const { university_email, password, username, first_name, last_name } = req.body;
    const response = await auth.api.signUpEmail({
      body: {
        email: university_email,
        password: password,
        name: username,
        firstName: first_name,
        lastName: last_name,
      },
      returnHeaders: true,
      asResponse: true
    })
    res.status(200).json({ message: "User signed up successfully", response: response.headers });
  } catch (error) {
    if (error instanceof APIError) {
      console.error("Sign-up error:", error);
      res.status(error.statusCode).json(error);
    }
  }
}

export const signIn = async (req: SignInRequest, res: Response) => {
  try {
    const { university_email, password } = req.body;
    await auth.api.signInEmail({
      body: {
        email: university_email,
        password: password,
      }
    })
    res.status(200).json({ message: "User signed in successfully" });
  } catch (error) {
    if (error instanceof APIError) {
      console.error("Sign-in error:", error);
      res.status(error.statusCode).json(error);
    }
  }
}