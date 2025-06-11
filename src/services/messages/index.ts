import express from 'express';
import messagesRouter from './routes';

const messagesApp = express();

messagesApp.use(express.json());
messagesApp.use('/', messagesRouter);

export { messagesApp };