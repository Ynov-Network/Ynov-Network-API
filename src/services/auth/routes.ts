import { Router } from "express";
import * as auth from "./handlers";
import { validationMiddleware } from "@/common/validation-middleware";
import { signInSchema, signUpSchema } from "./validation";

const router = Router();

router.post("/sign-up", validationMiddleware(signUpSchema), auth.signUp)
router.post("/sign-in", validationMiddleware(signInSchema), auth.signIn)

export default router;