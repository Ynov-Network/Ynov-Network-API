import express from 'express';
import usersRouter from './routes';
import helmet from "helmet";
import cookieParser from "cookie-parser";

const usersApp = express();

usersApp.use(helmet());
usersApp.use(cookieParser());
usersApp.use(express.urlencoded({ extended: true }));
usersApp.use(express.json());

usersApp.use('/', usersRouter);

export { usersApp }; 