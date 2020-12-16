import { UserDeletedListener } from '../user-deleted-listener';
import { Message } from 'node-nats-streaming';
import { UserDeletedEvent } from '@alsafullstack/common';
import { natsWrapper } from '../../../nats-wrapper';
import { User } from '../../../models/user';
import mongoose from 'mongoose';

const setup = async () => {
  const listener = new UserDeletedListener(natsWrapper.client);

  const user = User.build({
    id: mongoose.Types.ObjectId().toHexString(),
    name: 'test',
    userName: 'test',
  });

  await user.save();

  if (!user.id) throw new Error('ID missing');
  const data: UserDeletedEvent['data'] = {
    id: user.id,
    userName: user.userName,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, user, data, msg };
};

it('removes the user', async () => {
  const { listener, data, user, msg } = await setup();

  await listener.onMessage(data, msg);

  const userNotFound = await User.findById(user.id);

  expect(userNotFound).toBeNull();
});

it('acks the mssage', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
