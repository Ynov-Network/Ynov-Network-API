import express from 'express';
import searchRouter from './routes';

const searchApp = express();

searchApp.use(express.json());
searchApp.use('/', searchRouter);

export { searchApp }; 