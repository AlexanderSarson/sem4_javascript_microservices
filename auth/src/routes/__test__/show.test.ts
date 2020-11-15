import request from 'supertest';
import { app } from '../../app';

it('returns 404 if user is not found', async () => {
  await request(app).get('/api/users/blabla').send().expect(404);
});

it('returns user by username', async () => {
  const userName = 'team1';
  await request(app)
    .post('/api/users')
    .send({ userName, password: 'secret', name: 'Hans' })
    .expect(201);

  const response = await request(app)
    .get(`/api/users/${userName}`)
    .send()
    .expect(200);

  expect(response.body.userName).toEqual(userName);
});
