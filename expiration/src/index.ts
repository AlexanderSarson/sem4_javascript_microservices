import { natsWrapper } from './nats-wrapper';
import { PositionCreatedListener } from './events/listeners/position-created-listener';

const start = async () => {
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
    // so NATS can remove clients
    process.on('SIGINT', () => natsWrapper.client.close());
    process.on('SIGTERM', () => natsWrapper.client.close());

    new PositionCreatedListener(natsWrapper.client).listen();
  } catch (err) {
    console.error(err);
  }
};

start();
