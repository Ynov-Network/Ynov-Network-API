import type { Request } from 'express';
import type {
  EventIdParams,
  CreateEventBody,
  UpdateEventBody,
} from './validations';

export interface GetEventsRequest extends Request {
  query: {
    page: string;
    limit: string;
    event_type: string;
    sortBy: string;
    q: string;
  }
}

export interface GetEventByIdRequest extends Request {
  params: EventIdParams;
}

export interface CreateEventRequest extends Request {
  body: CreateEventBody;
}

export interface UpdateEventRequest extends Request {
  params: EventIdParams;
  body: UpdateEventBody;
}

export interface DeleteEventRequest extends Request {
  params: EventIdParams;
}

export interface JoinOrLeaveEventRequest extends Request {
  params: EventIdParams;
}