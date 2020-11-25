import {
  Listener,
  PositionDeletedEvent,
  Subjects,
} from '@alsafullstack/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { expirationQueue } from '../../queues/expiration-queue';

class PositionDeletedListener extends Listener<PositionDeletedEvent> {
  readonly subject = Subjects.PositionDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: PositionDeletedEvent['data'], msg: Message) {
    const job = await expirationQueue.getJob(data.id);
    if (job) {
      await job.remove();
      console.log('Removing old position...');
    }
    msg.ack();
  }
}

export { PositionDeletedListener };
