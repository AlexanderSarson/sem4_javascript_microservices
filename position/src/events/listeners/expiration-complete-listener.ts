import {
  Listener,
  ExpirationCompleteEvent,
  Subjects,
} from '@alsafullstack/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Position } from '../../models/position';
import { PositionExpiredPublisher } from '../publishers/position-expired-publisher';
import { natsWrapper } from '../../nats-wrapper';

class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
  queueGroupName = queueGroupName;

  async onMessage(data: ExpirationCompleteEvent['data'], msg: Message) {
    const { positionId } = data;
    const isActive = false;

    let position = await Position.findById(positionId).populate('User');
    if (!position) throw new Error('Could not find positionId: ' + positionId);

    position = await Position.updatePosition(
      position.user,
      position.location.coordinates,
      isActive,
      position.expiresAt
    );

    new PositionExpiredPublisher(natsWrapper.client).publish({
      id: position.id,
      version: position.version,
    });

    msg.ack();
  }
}

export { ExpirationCompleteListener };
