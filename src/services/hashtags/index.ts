import express from 'express';
import hashtagsRouter from './routes';
import helmet from "helmet";
import cookieParser from "cookie-parser";

const hashtagsApp = express();

hashtagsApp.use(helmet());
hashtagsApp.use(cookieParser());
hashtagsApp.use(express.urlencoded({ extended: true }));
hashtagsApp.use(express.json());

hashtagsApp.use('/', hashtagsRouter);

export { hashtagsApp }; 