import type { Request } from "express";
import type { ReportIdParams, UpdateReportStatusBody } from "./validations";

// GET /moderation/reports
export interface GetReportsRequest extends Request {
  query: {
    page: string;
    limit: string;
    status: string;
  };
}

// PUT /moderation/reports/:reportId
export interface UpdateReportRequest extends Request {
  params: ReportIdParams;
  body: UpdateReportStatusBody;
}