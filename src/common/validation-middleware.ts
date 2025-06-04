import type { Request, Response, NextFunction } from "express";
import type { ZodType, z } from "zod/v4";

export const validationMiddleware = <Schema extends ZodType>(schema: Schema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req.body as z.infer<Schema>);

    if (!result.success) {
      const errors: Record<string, string> = {};

      result.error.issues.forEach(err => {
        const field = err.path.join('.');
        errors[field] = err.message;
      });

      res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors,
      });
      return;
    }

    req.body = result.data;
    next();
  };
};