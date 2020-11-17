import { UserCreatedListener } from '../user-created-listener';
import { Message } from 'node-nats-streaming';
import { UserCreatedEvent } from '@alsafullstack/common';
import { natsWrapper } from '../../../nats-wrapper';
import { User } from '../../../models/user';
import mongoose from 'mongoose';

const setup = async () => {
  const listener = new UserCreatedListener(natsWrapper.client);

  const data: UserCreatedEvent['data'] = {
    id: mongoose.Types.ObjectId().toHexString(),
    name: 'test',
    userName: 'test',
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, data, msg };
};

it('creates and saves a user', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const user = await User.findById(data.id);

  expect(user).toBeDefined();
  expect(user!.userName).toEqual(data.userName);
  expect(user!.name).toEqual(data.name);
});

it('acks the mssage', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
