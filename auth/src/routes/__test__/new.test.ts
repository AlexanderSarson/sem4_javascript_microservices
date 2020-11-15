import request from 'supertest';
import { app } from '../../app';

it('returns a 201 on successful create user', async () => {
  return request(app)
    .post('/api/users')
    .send({ userName: 'team1', password: 'secret', name: 'Hans' })
    .expect(201);
});

it('returns a 400 with an invalid username', async () => {
  return request(app)
    .post('/api/users')
    .send({ userName: '', password: 'secret', name: 'Hans' })
    .expect(400);
});

it('returns a 400 with an invalid password', async () => {
  await request(app)
    .post('/api/users')
    .send({ userName: 'asdas', password: 'sds', name: 'Hans' })
    .expect(400);

  await request(app)
    .post('/api/users')
    .send({
      userName: 'asdas',
      password: 'sdssdfsdfffffddfdfdfdfd',
      name: 'Hans',
    })
    .expect(400);
});

it('returns a 400 with an invalid name', async () => {
  return request(app)
    .post('/api/users')
    .send({ userName: 'asdas', password: 'asdasd', name: '' })
    .expect(400);
});

it('returns a 400 with missing name and password and username', async () => {
  await request(app)
    .post('/api/users')
    .send({ userName: 'asdas', password: 'asdasd' })
    .expect(400);

  await request(app)
    .post('/api/users')
    .send({ userName: 'asdasd', name: 'asdasd' })
    .expect(400);

  await request(app)
    .post('/api/users')
    .send({ password: 'asdasd', name: 'asdas' })
    .expect(400);
});

it('disallows duplicate usernames', async () => {
  await request(app)
    .post('/api/users')
    .send({ userName: 'team1', password: 'secret', name: 'Hans' })
    .expect(201);

  await request(app)
    .post('/api/users')
    .send({ userName: 'team1', password: 'secret', name: 'Hans' })
    .expect(400);
});

it('sets a cookie after successful creation', async () => {
  const response = await request(app)
    .post('/api/users')
    .send({ userName: 'team1', password: 'secret', name: 'Hans' })
    .expect(201);

  expect(response.get('Set-Cookie')).toBeDefined();
});
