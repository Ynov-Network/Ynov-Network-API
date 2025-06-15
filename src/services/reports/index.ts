import express from 'express';
import reportsRouter from './routes';
import helmet from "helmet";
import cookieParser from "cookie-parser";

const reportsApp = express();

reportsApp.use(helmet());
reportsApp.use(cookieParser());
reportsApp.use(express.urlencoded({ extended: true }));

reportsApp.use(express.json());
reportsApp.use('/', reportsRouter);

export { reportsApp }; 