import request from 'supertest';
import { app } from '../../app';

it('throws not authorized error when not loggedin', async () => {
  await request(app).delete('/api/users').send({ userName: test }).expect(401);
});

it('successfully delete user when loggedin', async () => {
  const cookie = await global.signin();

  const user = { userName: 'team1', password: 'secret', name: 'Hans' };
  await request(app).post('/api/users').send(user).expect(201);

  const response = await request(app)
    .delete('/api/users')
    .set('Cookie', cookie)
    .send({ userName: user.userName })
    .expect(200);

  expect(response.body.userName).toEqual(user.userName);
});
