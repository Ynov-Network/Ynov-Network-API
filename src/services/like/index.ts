import express from 'express';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import likesRouter from './routes';

const likeApp = express();

likeApp.use(helmet());
likeApp.use(cookieParser());
likeApp.use(express.urlencoded({ extended: true }));
likeApp.use(express.json());

likeApp.use('/', likesRouter);

export { likeApp }; 