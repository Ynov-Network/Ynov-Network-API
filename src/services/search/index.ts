import express from 'express';
import searchRouter from './routes';
import helmet from "helmet";
import cookieParser from "cookie-parser";

const searchApp = express();

searchApp.use(helmet());
searchApp.use(cookieParser());
searchApp.use(express.urlencoded({ extended: true }));
searchApp.use(express.json());

searchApp.use('/', searchRouter);

export { searchApp }; 