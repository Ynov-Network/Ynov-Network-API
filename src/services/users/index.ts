import express from 'express';
import usersRouter from './routes';

const usersApp = express();

usersApp.use(express.json());
usersApp.use('/', usersRouter);

export { usersApp }; 