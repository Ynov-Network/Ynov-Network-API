import express from 'express';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import messagesRouter from './routes';

const messagesApp = express();

messagesApp.use(helmet());
messagesApp.use(cookieParser());
messagesApp.use(express.urlencoded({ extended: true }));
messagesApp.use(express.json());

messagesApp.use('/', messagesRouter);

export { messagesApp };