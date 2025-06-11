import express from 'express';
import notificationsRouter from './routes';

const notificationsApp = express();

notificationsApp.use(express.json());
notificationsApp.use('/', notificationsRouter);

export { notificationsApp }; 