import express from 'express';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import feedRouter from './routes';

const feedApp = express();

feedApp.use(helmet());
feedApp.use(cookieParser());
feedApp.use(express.urlencoded({ extended: true }));
feedApp.use(express.json());

feedApp.use('/', feedRouter);

export { feedApp }; 