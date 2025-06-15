import express from 'express';
import helmet from "helmet";
import cookieParser from "cookie-parser";
import eventsRouter from './routes';

const eventsApp = express();

eventsApp.use(helmet());
eventsApp.use(cookieParser());
eventsApp.use(express.urlencoded({ extended: true }));
eventsApp.use(express.json());

eventsApp.use('/', eventsRouter);

export { eventsApp }; 