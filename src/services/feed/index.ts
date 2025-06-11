import express from 'express';
import feedRouter from './routes';

const feedApp = express();

feedApp.use(express.json());
feedApp.use('/', feedRouter);

export { feedApp }; 