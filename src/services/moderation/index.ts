import express from 'express';
import moderationRouter from './routes';

const moderationApp = express();

moderationApp.use(express.json());
moderationApp.use('/', moderationRouter);

export { moderationApp }; 