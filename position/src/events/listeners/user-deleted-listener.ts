import {
  Listener,
  UserDeletedEvent,
  Subjects,
  NotFoundError,
} from '@alsafullstack/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';

class UserDeletedListener extends Listener<UserDeletedEvent> {
  readonly subject = Subjects.UserDeleted;
  queueGroupName = queueGroupName;

  async onMessage(data: UserDeletedEvent['data'], msg: Message) {
    const { id, userName } = data;

    const user = await User.findById(id);

    if (!user) throw new NotFoundError('Could not find user: ' + userName);

    await user.deleteOne();

    msg.ack();
  }
}

export { UserDeletedListener };
