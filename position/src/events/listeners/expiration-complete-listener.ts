import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
  NotFoundError,
} from '@alsafullstack/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Position } from '../../models/position';
import { PositionDeletedPublisher } from '../publishers/position-deleted-publisher';
import { natsWrapper } from '../../nats-wrapper';

class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const { positionId } = data;

    const position = await Position.findById(positionId);
    if (!position)
      throw new NotFoundError('Could not find positionId: ' + positionId);

    await position.deleteOne();

    new PositionDeletedPublisher(natsWrapper.client).publish({
      id: position.id,
    });

    msg.ack();
  }
}

export { ExpirationCompleteListener };
