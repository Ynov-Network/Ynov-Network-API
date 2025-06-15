import type { Request } from "express";
import type { CreateReportBody } from "./validations";

export interface CreateReportRequest extends Request {
  body: CreateReportBody;
};