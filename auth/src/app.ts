import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import {
  NotFoundError,
  errorHandler,
  currentUser,
} from '@alsafullstack/common';

import { newUserRouter } from './routes/new';
import { allUserRouter } from './routes/all';
import { showUserRouter } from './routes/show';
import { signinUserRouter } from './routes/signin';
import { deleteUserRouter } from './routes/delete';
import { healthCheckRouter } from './routes/healthcheck';

const app = express();

app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false, //process.env.NODE_ENV !== 'test',
  })
);
app.use(healthCheckRouter);
app.use(currentUser);
app.use(newUserRouter);
app.use(allUserRouter);
app.use(showUserRouter);
app.use(signinUserRouter);
app.use(deleteUserRouter);

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
