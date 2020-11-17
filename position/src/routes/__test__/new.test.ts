import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';
import { Position } from '../../models/position';
import mongoose from 'mongoose';
import { cookie } from 'express-validator';

const setup = async () => {
  const user = User.build({
    id: mongoose.Types.ObjectId().toHexString(),
    name: 'test',
    userName: 'test',
  });

  await user.save();

  const cookie = global.signin(user.id, user.userName);

  return { user, cookie };
};

it('fails when not logged in', async () => {
  await request(app)
    .post('/api/position')
    .send({ latitude: 0, longitude: 0 })
    .expect(401);
});

it('fails when latitude is missing', async () => {
  const cookie = global.signin();

  await request(app)
    .post('/api/position')
    .set('Cookie', cookie)
    .send({ longitude: 0 })
    .expect(400);
});

it('fails when longitude is missing', async () => {
  const cookie = global.signin();

  await request(app)
    .post('/api/position')
    .set('Cookie', cookie)
    .send({ latitude: 0 })
    .expect(400);
});

it('creates position', async () => {
  const { cookie } = await setup();

  await request(app)
    .post('/api/position')
    .set('Cookie', cookie)
    .send({ latitude: 0, longitude: 0 })
    .expect(201);
});
