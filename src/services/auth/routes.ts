import { Router } from "express";
import * as auth from "./handlers";
import { validationMiddleware } from "@/common/middleware/validation.middleware";
import { signInSchema, signInSocialSchema, signUpSchema } from "./validation";

const router = Router();

router.post("/sign-up", validationMiddleware({ body: signUpSchema }), auth.signUp)
router.post("/sign-in", validationMiddleware({ body: signInSchema }), auth.signIn)
router.post("/sign-in/social", validationMiddleware({ body: signInSocialSchema }), auth.signInSocial)
router.post("/sign-out", auth.signOut)
router.get("/get-user", auth.getUser)

export default router;