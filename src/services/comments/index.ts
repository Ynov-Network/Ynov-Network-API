import express from 'express';
import commentsRouter from './routes';

const commentsApp = express();

commentsApp.use(express.json());
commentsApp.use('/', commentsRouter);

export { commentsApp };
