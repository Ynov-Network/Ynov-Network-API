import { Router } from 'express';
import * as searchHandlers from './handlers';
import { validationMiddleware } from '@/common/middleware/validation.middleware';
import { searchQuerySchema } from './validations';

const router = Router();

router.get(
  '/',
  validationMiddleware({ query: searchQuerySchema }),
  searchHandlers.performSearch
);

export default router; 