import type { Response } from "express";
import type { SignInRequest, SignUpRequest } from "./request-types";
import { auth } from "@/lib/auth";
import { APIError } from "better-auth/api";
import { setCookieToHeader } from "better-auth/cookies";

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
      asResponse: true,
    });

    setCookieToHeader(response.headers);
    res.status(response.status).json(response.body);
  } catch (error) {
    if (error instanceof APIError) {
      console.error("Sign-up error:", error.body);
      res.status(error.statusCode).json({ message: error.body?.message || "An error occurred during sign-up." });
      return;
    }
    console.error("Unexpected sign-up error:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
}

export const signIn = async (req: SignInRequest, res: Response) => {
  try {
    const { university_email, password } = req.body;
    const response = await auth.api.signInEmail({
      asResponse: true,
      body: {
        email: university_email,
        password: password,
      }
    });

    setCookieToHeader(response.headers);
    res.status(response.status).json(response.body);
  } catch (error) {
    if (error instanceof APIError) {
      console.error("Sign-in error:", error.body);
      res.status(error.statusCode).json({ message: error.body?.message || "An error occurred during sign-in." });
      return;
    }
    console.error("Unexpected sign-in error:", error);
    res.status(500).json({ message: "An internal server error occurred." });
  }
}