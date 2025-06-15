import express from 'express';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import groupsRouter from './routes';

const groupsApp = express();

groupsApp.use(helmet());
groupsApp.use(cookieParser());
groupsApp.use(express.urlencoded({ extended: true }));
groupsApp.use(express.json());

groupsApp.use('/', groupsRouter);

export { groupsApp }; 