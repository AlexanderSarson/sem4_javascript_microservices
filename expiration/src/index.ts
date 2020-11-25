import { natsWrapper } from './nats-wrapper';
import { PositionUpdatedListener } from './events/listeners/position-updated-listener';
import { PositionDeletedListener } from './events/listeners/position-deleted-listener';
import { app } from './app';

const start = async () => {
  console.log('Starting up....');
  if (!process.env.NATS_URL) {
    throw new Error('NATS url must be defined');
  }
  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error('NATS Cluster id must be defined');
  }
  if (!process.env.NATS_CLIENT_ID) {
    throw new Error('NATS Client Id must be defined');
  }

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
    // so NATS can remove clients from itself ok
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new PositionUpdatedListener(natsWrapper.client).listen();
    new PositionDeletedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
  app.listen(3000, () => console.log('Listening on port 3000'));
};

start();
