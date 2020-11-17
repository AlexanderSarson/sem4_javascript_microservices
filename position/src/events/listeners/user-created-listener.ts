import { Listener, UserCreatedEvent, Subjects } from '@alsafullstack/common';
import { Message } from 'node-nats-streaming';
import { queueGroupName } from './queue-group-name';
import { User } from '../../models/user';

class UserCreatedListener extends Listener<UserCreatedEvent> {
  readonly subject = Subjects.UserCreated;
  queueGroupName = queueGroupName;

  async onMessage(data: UserCreatedEvent['data'], msg: Message) {
    const { id, userName, name } = data;

    const user = User.build({ id, userName, name });
    await user.save();

    msg.ack();
  }
}

export { UserCreatedListener };
