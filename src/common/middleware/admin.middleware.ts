import type { Request, Response, NextFunction } from 'express';

export const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.auth?.user?.role !== 'admin') {
    res.status(403).json({ message: 'Forbidden: Administrator access required.' });
    return;
  }
  next();
}; 