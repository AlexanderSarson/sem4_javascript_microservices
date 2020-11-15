import request from 'supertest';
import { app } from '../../app';
import { User } from '../../models/user';

it('returns a list of users', async () => {
  const user1 = User.build({
    userName: 'team1',
    password: 'secret',
    name: 'Hans',
    role: 'user',
  });
  const user2 = User.build({
    userName: 'team2',
    password: 'secret',
    name: 'Hans',
    role: 'user',
  });
  const user3 = User.build({
    userName: 'team3',
    password: 'secret',
    name: 'Hans',
    role: 'user',
  });
  await user1.save();
  await user2.save();
  await user3.save();

  const response = await request(app).get('/api/users').send().expect(200);

  expect(response.body.length).toBe(3);
});
