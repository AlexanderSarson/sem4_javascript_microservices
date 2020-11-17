import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  NotFoundError,
  errorHandler,
  currentUser,
} from '@alsafullstack/common';
import { newPositionRouter } from './routes/new';
import { findNearbyPlayers } from './routes/nearby-players';

const app = express();
app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false, //process.env.NODE_ENV !== 'test',
  })
);

app.use(currentUser);
app.use(newPositionRouter);
app.use(findNearbyPlayers);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
