import express from 'express';
import postsRouter from './routes';

const postsApp = express();

postsApp.use(express.json());
postsApp.use('/', postsRouter);

export { postsApp }; 