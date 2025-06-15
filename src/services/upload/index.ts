import express from 'express';
import uploadRouter from './routes';
import helmet from "helmet";
import cookieParser from "cookie-parser";

const uploadApp = express();

uploadApp.use(helmet());
uploadApp.use(cookieParser());
uploadApp.use(express.urlencoded({ extended: true }));

// The upload routes use multipart/form-data, so express.json() is not strictly needed
// for the routes in this service, but it's good practice to include it.
uploadApp.use(express.json());
uploadApp.use('/', uploadRouter);

export { uploadApp }; 