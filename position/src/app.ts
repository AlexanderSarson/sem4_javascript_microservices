import express from 'express';
import 'express-async-errors';
import { json } from 'body-parser';
import cookieSession from 'cookie-session';
import { ApolloServer } from 'apollo-server-express';
import { buildFederatedSchema } from '@apollo/federation';
import { typeDefs } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import {
  NotFoundError,
  errorHandler,
  currentUser,
} from '@alsafullstack/common';
import { newPositionRouter } from './routes/new';
import { updatePositionRouter } from './routes/update';
import { findNearbyPlayers } from './routes/nearby-players';
import { healthCheckRouter } from './routes/healthcheck';

const app = express();
const path = '/position/graphql';

app.set('trust proxy', true);
app.use(json());
app.use(
  cookieSession({
    signed: false,
    secure: false, //process.env.NODE_ENV !== 'test'
  })
);
app.use(healthCheckRouter);
app.use(currentUser);
app.use(newPositionRouter);
app.use(findNearbyPlayers);
app.use(updatePositionRouter);
const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers: resolvers as any }]),
  context: ({ req, res }) => ({ req, res }),
  introspection: true,
});
server.applyMiddleware({ app, path, cors: false });

app.all('*', async (req, res) => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
