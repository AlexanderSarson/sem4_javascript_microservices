import {
  Listener,
  PositionDeletedEvent,
  Subjects,
} from '@alsafullstack/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Position } from '../../models/position';

class PositionDeletedListener extends Listener<PositionDeletedEvent> {
  readonly subject = Subjects.PositionDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: PositionDeletedEvent['data'], msg: Message) {
    const { id } = data;

    const position = await Position.findById(id);
    if (!position) throw new Error('Position not found id: ' + id);

    await position.deleteOne();

    msg.ack();
  }
}

export { PositionDeletedListener };
