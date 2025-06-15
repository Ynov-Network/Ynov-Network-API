import express from 'express';
import moderationRouter from './routes';
import helmet from "helmet";
import cookieParser from "cookie-parser";

const moderationApp = express();

moderationApp.use(helmet());
moderationApp.use(cookieParser());
moderationApp.use(express.urlencoded({ extended: true }));
moderationApp.use(express.json());

moderationApp.use('/', moderationRouter);

export { moderationApp }; 