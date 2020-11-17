import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';
import { Position } from '../../models/position';
import mongoose from 'mongoose';
import { cookie } from 'express-validator';

const setup = async () => {
  const user1 = User.build({
    id: mongoose.Types.ObjectId().toHexString(),
    name: 'test',
    userName: 'test',
  });

  await user1.save();

  const position1 = await Position.build({
    latitude: 0,
    longitude: 0,
    expiresAt: new Date(),
    user: user1,
  });

  const cookie1 = global.signin(user1.id, user1.userName);

  const user2 = User.build({
    id: mongoose.Types.ObjectId().toHexString(),
    name: 'test2',
    userName: 'test2',
  });

  await user2.save();

  const position2 = await Position.build({
    latitude: 0,
    longitude: 0,
    expiresAt: new Date(),
    user: user2,
  });

  const cookie2 = global.signin(user2.id, user2.userName);

  const user3 = User.build({
    id: mongoose.Types.ObjectId().toHexString(),
    name: 'test2',
    userName: 'test2',
  });

  await user3.save();

  const position3 = await Position.build({
    latitude: 0.01,
    longitude: 0.01,
    expiresAt: new Date(),
    user: user3,
  });

  const cookie3 = global.signin(user3.id, user3.userName);

  return {
    user1,
    user2,
    user3,
    position1,
    position2,
    position3,
    cookie1,
    cookie2,
    cookie3,
  };
};

it('returns user2 as nearby player but not user3 with distance 10', async () => {
  const { user2, cookie1 } = await setup();
  const distance = 10;

  const response = await request(app)
    .post('/api/position/nearbyplayers')
    .set('Cookie', cookie1)
    .send({ latitude: 0, longitude: 0, distance })
    .expect(200);

  expect(response.body[0].user.userName).toEqual(user2.userName);
  expect(response.body.length).toEqual(1);
});

it('returns user2 and user3 as nearby players with distance 10000', async () => {
  const { user2, user3, cookie1 } = await setup();
  const distance = 10000;

  const response = await request(app)
    .post('/api/position/nearbyplayers')
    .set('Cookie', cookie1)
    .send({ latitude: 0, longitude: 0, distance })
    .expect(200);

  expect(response.body[0].user.userName).toEqual(user2.userName);
  expect(response.body[1].user.userName).toEqual(user3.userName);
  expect(response.body.length).toEqual(2);
});

it('fails when not logged in', async () => {
  await request(app)
    .post('/api/position/nearbyplayers')
    .send({ latitude: 0, longitude: 0, distance: 10 })
    .expect(401);
});

it('fails when latitude is missing', async () => {
  const cookie = global.signin();

  await request(app)
    .post('/api/position/nearbyplayers')
    .set('Cookie', cookie)
    .send({ longitude: 0, distance: 10 })
    .expect(400);
});

it('fails when longitude is missing', async () => {
  const cookie = global.signin();

  await request(app)
    .post('/api/position/nearbyplayers')
    .set('Cookie', cookie)
    .send({ latitude: 0, distance: 10 })
    .expect(400);
});

it('fails when distance is missing', async () => {
  const cookie = global.signin();

  await request(app)
    .post('/api/position/nearbyplayers')
    .set('Cookie', cookie)
    .send({ latitude: 0, longitude: 0 })
    .expect(400);
});
