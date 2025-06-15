import express from 'express';
import savedPostsRouter from './routes';
import helmet from "helmet";
import cookieParser from "cookie-parser";

const savedPostsApp = express();

savedPostsApp.use(helmet());
savedPostsApp.use(cookieParser());
savedPostsApp.use(express.urlencoded({ extended: true }));
savedPostsApp.use(express.json());

savedPostsApp.use('/', savedPostsRouter);

export { savedPostsApp }; 