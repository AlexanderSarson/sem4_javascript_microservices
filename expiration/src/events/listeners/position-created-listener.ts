import {
  Listener,
  PositionCreatedEvent,
  Subjects,
} from '@alsafullstack/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

class PositionCreatedListener extends Listener<PositionCreatedEvent> {
  readonly subject = Subjects.PositionCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: PositionCreatedEvent['data'], msg: Message) {
    const delay = new Date(data.expiresAt).getTime() - new Date().getTime();
    const job = await expirationQueue.getJob(data.id);
    if (job) {
      await job.remove();
      console.log('Position already in queue - removing old position...');
    }

    await expirationQueue.add(
      {
        positionId: data.id,
      },
      { delay: delay, jobId: data.id }
    );
    console.log('Waiting this many milliseconds to process the job:', delay);

    msg.ack();
  }
}

export { PositionCreatedListener };
