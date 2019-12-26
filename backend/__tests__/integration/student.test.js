import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Student - create', () => {
  let token;

  beforeAll(async () => {
    await truncate();
    const admin = await factory.create('User');

    const response = await request(app)
      .post('/sessions')
      .send({
        email: admin.email,
        password: admin.password,
      });

    token = response.body.token;
  });

  it('should be able to register', async () => {
    const student = await factory.attrs('Student');

    const response = await request(app)
      .post('/students')
      .set('Authorization', `bearer ${token}`)
      .send(student);

    expect(response.body).toHaveProperty('id');
  });
});