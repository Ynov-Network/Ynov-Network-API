import { Router } from "express";
import * as auth from "./handlers";
import { validationMiddleware } from "@/common/middleware/validation.middleware";
import { signInSchema, signUpSchema } from "./validation";

const router = Router();

router.post("/sign-up", validationMiddleware({ body: signUpSchema }), auth.signUp)
router.post("/sign-in", validationMiddleware({ body: signInSchema }), auth.signIn)

export default router;