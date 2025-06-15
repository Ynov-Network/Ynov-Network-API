import express from 'express';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import commentsRouter from './routes';

const commentsApp = express();

commentsApp.use(helmet());
commentsApp.use(cookieParser());
commentsApp.use(express.urlencoded({ extended: true }));
commentsApp.use(express.json());

commentsApp.use('/', commentsRouter);

export { commentsApp };
