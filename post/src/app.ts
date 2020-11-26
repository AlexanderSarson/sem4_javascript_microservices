import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  NotFoundError,
  errorHandler,
  currentUser,
} from '@alsafullstack/common';
import { newPostRouter } from './routes/new';
import { allPostRouter } from './routes/all';
import { showPostRouter } from './routes/show';
import { findPostRouter } from './routes/find';
import { healthCheckRouter } from './routes/healthcheck';
import { gameAreaRouter } from './routes/game-area';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false,
  })
);

app.use(healthCheckRouter);
app.use(currentUser);
app.use(findPostRouter);
app.use(newPostRouter);
app.use(allPostRouter);
app.use(showPostRouter);
app.use(gameAreaRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
