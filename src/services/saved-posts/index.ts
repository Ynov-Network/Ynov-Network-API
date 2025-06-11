import express from 'express';
import savedPostsRouter from './routes';

const savedPostsApp = express();

savedPostsApp.use(express.json());
savedPostsApp.use('/', savedPostsRouter);

export { savedPostsApp }; 