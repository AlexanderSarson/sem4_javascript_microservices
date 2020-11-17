import { ExpirationCompleteListener } from '../expiration-complete-listener';
import { Message } from 'node-nats-streaming';
import { ExpirationCompleteEvent } from '@alsafullstack/common';
import { natsWrapper } from '../../../nats-wrapper';
import { User } from '../../../models/user';
import { Position } from '../../../models/position';
import mongoose from 'mongoose';

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  const user = User.build({
    id: mongoose.Types.ObjectId().toHexString(),
    name: 'test',
    userName: 'test',
  });

  await user.save();

  const position = await Position.build({
    latitude: 0,
    longitude: 0,
    expiresAt: new Date(),
    user: user,
  });

  const data: ExpirationCompleteEvent['data'] = {
    positionId: position.id,
  };

  // @ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, user, position, data, msg };
};

it('removes the position', async () => {
  const { listener, position, data, msg } = await setup();
  await listener.onMessage(data, msg);

  const positionNotFound = await Position.findById(position.id);

  expect(positionNotFound).toBeNull();
});

it('acks the mssage', async () => {
  const { listener, data, msg } = await setup();
  await listener.onMessage(data, msg);
  expect(msg.ack).toHaveBeenCalled();
});
