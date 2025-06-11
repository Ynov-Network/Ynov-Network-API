import express from 'express';
import likesRouter from './routes';

const likeApp = express();

likeApp.use(express.json());
likeApp.use('/', likesRouter);

export { likeApp }; 