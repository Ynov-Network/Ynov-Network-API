import type { Request, Response, NextFunction } from "express";
import { z, type ZodType } from "zod/v4";

export interface RequestValidationSchemas<
  TParams extends ZodType,
  TBody extends ZodType,
  TQuery extends ZodType,
> {
  params?: TParams;
  body?: TBody;
  query?: TQuery;
}

export const validationMiddleware = <
  TParams extends ZodType,
  TBody extends ZodType,
  TQuery extends ZodType,
>(
  schemas: RequestValidationSchemas<TParams, TBody, TQuery>
) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    let parseRequestResult: ParseRequestReturn = {
      data: null,
      success: false,
      errors: "",
    };

    if (schemas.params) {
      parseRequestResult = parseRequest(req.params, schemas.params, "params");
    }
    if (schemas.body) {
      parseRequestResult = parseRequest(req.body, schemas.body, "body");
    }
    if (schemas.query) {
      parseRequestResult = parseRequest(req.query, schemas.query, "query");
    }

    if (!parseRequestResult.success) {
      res.status(400).json(parseRequestResult);
      return;
    } 

    next();
  };
};

interface ParseRequestReturn {
  data: unknown;
  success: boolean;
  errors: string;
}

const parseRequest = (
  dataToValidate: unknown,
  schema: ZodType | undefined,
  partName: "params" | "body" | "query"
): ParseRequestReturn => {
  if (!schema) return {
    success: false,
    data: dataToValidate,
    errors: `No schema provided for ${partName}`,
  };

  const { data, success, error } = schema.safeParse(dataToValidate);
  if (success) {
    return {
      success: true,
      data,
      errors: `Validation successful for ${partName}`,
    };
  } else {
    return {
      success: false,
      data: dataToValidate,
      errors: z.prettifyError(error),
    };
  }
};
