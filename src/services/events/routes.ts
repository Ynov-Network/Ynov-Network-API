import { Router } from 'express';
import * as eventHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import {
  createEventBodySchema,
  updateEventBodySchema,
  getEventsQuerySchema,
  eventIdParamsSchema,
} from './validations';

const router = Router();

// --- Event Collection Routes ---
router.post(
  '/',
  validationMiddleware({ body: createEventBodySchema }),
  eventHandlers.createEvent
);

router.get(
  '/',
  validationMiddleware({ query: getEventsQuerySchema }),
  eventHandlers.getAllEvents
);

// --- Single Event Routes ---
router.get(
  '/:eventId',
  validationMiddleware({ params: eventIdParamsSchema }),
  eventHandlers.getEventById
);

router.put(
  '/:eventId',
  validationMiddleware({ params: eventIdParamsSchema, body: updateEventBodySchema }),
  eventHandlers.updateEvent
);

router.delete(
  '/:eventId',
  validationMiddleware({ params: eventIdParamsSchema }),
  eventHandlers.deleteEvent
);

// --- Participant Routes ---
router.post(
  '/:eventId/join',
  validationMiddleware({ params: eventIdParamsSchema }),
  eventHandlers.joinEvent
);

router.delete(
  '/:eventId/leave',
  validationMiddleware({ params: eventIdParamsSchema }),
  eventHandlers.leaveEvent
);

export default router; 