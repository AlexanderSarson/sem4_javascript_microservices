import express from 'express';
import { healthCheckRouter } from './routes/healthcheck';

const app = express();

app.use(healthCheckRouter);

export { app };
