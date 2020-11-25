import {
  Listener,
  PositionExpiredEvent,
  Subjects,
} from '@alsafullstack/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Position } from '../../models/position';

class PositionExpiredListener extends Listener<PositionExpiredEvent> {
  readonly subject = Subjects.PositionExpired;
  queueGroupName = queueGroupName;

  async onMessage(data: PositionExpiredEvent['data'], msg: Message) {
    const { id, version } = data;

    const position = await Position.findByEvent({ id, version });

    if (!position) throw new Error('Could not find position');

    position.set({ isActive: false, version: version });

    await position.save();

    msg.ack();
  }
}

export { PositionExpiredListener };
