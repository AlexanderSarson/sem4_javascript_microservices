import Queue from 'bull';
import { ExpirationCompletePublisher } from '../events/publishers/expiration-complete-publisher';
import { natsWrapper } from '../nats-wrapper';
interface Payload {
  positionId: string;
}
const expirationQueue = new Queue<Payload>('position:expiration', {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  new ExpirationCompletePublisher(natsWrapper.client).publish({
    positionId: job.data.positionId,
  });
});

export { expirationQueue };
