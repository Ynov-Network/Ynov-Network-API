import express from 'express';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import postsRouter from './routes';

const postsApp = express();

postsApp.use(helmet());
postsApp.use(cookieParser());
postsApp.use(express.urlencoded({ extended: true }));
postsApp.use(express.json());

postsApp.use('/', postsRouter);

export { postsApp }; 