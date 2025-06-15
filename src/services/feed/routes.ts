import { Router } from 'express';
import * as feedHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import { getFeedQuerySchema } from './validations';

const router = Router();

// Get personalized feed for the logged-in user
router.get(
  '/personal',
  validationMiddleware({ query: getFeedQuerySchema }),
  feedHandlers.getUserFeed
);

// Get public feed for discovery
router.get(
  '/public',
  validationMiddleware({ query: getFeedQuerySchema }),
  feedHandlers.getPublicFeed
);

export default router; 