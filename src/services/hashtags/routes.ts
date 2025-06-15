import { Router } from 'express';
import * as hashtagHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import {
  getHashtagsQuerySchema,
  tagNameParamsSchema,
  getPostsByHashtagQuerySchema,
} from './validations';

const router = Router();

// Get a list of hashtags (e.g., for a trending page)
router.get(
  '/',
  validationMiddleware({ query: getHashtagsQuerySchema }),
  hashtagHandlers.getHashtags
);

// Get all posts for a specific hashtag
router.get(
  '/:tagName',
  validationMiddleware({
    params: tagNameParamsSchema,
    query: getPostsByHashtagQuerySchema,
  }),
  hashtagHandlers.getPostsByHashtag
);

export default router; 