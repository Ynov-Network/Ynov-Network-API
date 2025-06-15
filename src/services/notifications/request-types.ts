import type { Request } from "express";
import type { NotificationIdParams } from "./validations";

// For GET /notifications
export interface GetNotificationsRequest extends Request {
  query: {
    page?: string;
    limit?: string;
    filter?: string;
  }
}

// For PATCH /notifications/:notificationId/read
export interface MarkNotificationAsReadRequest extends Request {
  params: NotificationIdParams;
};

// For POST /notifications/read-all
export interface MarkAllNotificationsAsReadRequest extends Request { };