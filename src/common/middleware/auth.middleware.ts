import { User } from '@/db/schemas/users';
import { auth } from '@/lib/auth';
import { fromNodeHeaders } from "better-auth/node";
import type { Request, Response, NextFunction } from 'express';

export interface RequestUser {
  auth: {
    user: User;
  }
}

declare global {
  namespace Express {
    interface Request {
      auth: RequestUser["auth"];
    }
  }
}

export interface AuthenticatedRequest extends Request {
  auth: RequestUser["auth"];
}

export const protectRoute = async (req: Request, res: Response, next: NextFunction) => {
  const session = await auth.api.getSession({
    headers: fromNodeHeaders(req.headers),
  });

  if (!session?.user) {
    res.status(401).json({ message: 'Unauthorized: No active session found.' });
    return;
  }

  req.auth = { user: session.user as unknown as User };
  next();
};