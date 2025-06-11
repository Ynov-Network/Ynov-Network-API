import express from 'express';
import hashtagsRouter from './routes';

const hashtagsApp = express();

hashtagsApp.use(express.json());
hashtagsApp.use('/', hashtagsRouter);

export { hashtagsApp }; 