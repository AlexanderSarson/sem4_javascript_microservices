import {
  Listener,
  PositionUpdatedEvent,
  Subjects,
} from '@alsafullstack/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { Position } from '../../models/position';
import { User } from '../../models/user';

class PositionUpdatedListener extends Listener<PositionUpdatedEvent> {
  readonly subject = Subjects.PositionUpdated;
  queueGroupName = queueGroupName;

  async onMessage(data: PositionUpdatedEvent['data'], msg: Message) {
    const { userId, id, coordinates, isActive, version, expiresAt } = data;

    let position = await Position.findById(id).populate('user');

    if (position) {
      if (version - 1 !== position.version) {
        throw new Error('Position concurrency versions dont match');
      }
      await Position.updatePosition(
        position.user,
        id,
        coordinates,
        isActive,
        new Date(expiresAt),
        version
      );
    } else {
      const user = await User.findById(userId);
      if (!user) throw new Error('User not found');

      await Position.updatePosition(
        user,
        id,
        coordinates,
        isActive,
        new Date(expiresAt),
        version
      );
    }

    msg.ack();
  }
}

export { PositionUpdatedListener };
