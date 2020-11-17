import { app } from './app';
import mongoose from 'mongoose';
import { natsWrapper } from './nats-wrapper';
import { UserCreatedListener } from './events/listeners/user-created-listener';
import { ExpirationCompleteListener } from './events/listeners/expiration-complete-listener';
import { UserDeletedListener } from './events/listeners/user-deleted-listener';

const start = async () => {
  console.log('Starting up....');
  if (!process.env.MONGO_URI) throw new Error('MONGO_URI must be defined');
  if (!process.env.JWT_KEY) throw new Error('JWT_KEY must be defined');
  if (!process.env.NATS_URL) throw new Error('NATS_URL must be defined');
  if (!process.env.EXPIRATION_WINDOW_SECONDS)
    throw new Error('EXPIRATION_WINDOW_SECONDS must be defined');
  if (!process.env.NATS_CLUSTER_ID)
    throw new Error('NATS_CLUSTER_ID must be defined');
  if (!process.env.NATS_CLIENT_ID)
    throw new Error('NATS_CLIENT_ID must be defined');

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
    );
    natsWrapper.client.on('close', () => {
      console.log('NATS connection closed!');
      process.exit();
    });
    //Remove nats client ok
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new UserCreatedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new UserDeletedListener(natsWrapper.client).listen();

    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
    });
    console.log('Connected to MongoDb');
  } catch (err) {
    console.error(err);
  }

  app.listen(3000, () => console.log('Listening on port 3000'));
};

start();
