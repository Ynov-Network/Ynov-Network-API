import express from 'express';
import reportsRouter from './routes';

const reportsApp = express();

reportsApp.use(express.json());
reportsApp.use('/', reportsRouter);

export { reportsApp }; 