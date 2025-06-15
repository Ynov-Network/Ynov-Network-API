import express from 'express';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import notificationsRouter from './routes';

const notificationsApp = express();

notificationsApp.use(helmet());
notificationsApp.use(cookieParser());
notificationsApp.use(express.urlencoded({ extended: true }));

notificationsApp.use(express.json());
notificationsApp.use('/', notificationsRouter);

export { notificationsApp }; 