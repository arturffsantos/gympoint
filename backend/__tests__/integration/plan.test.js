import request from 'supertest';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('Plan - create', () => {
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
    const plan = await factory.attrs('Plan');

    const response = await request(app)
      .post('/plans')
      .set('Authorization', `bearer ${token}`)
      .send(plan);

    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register due to existing title', async () => {
    const plan = await factory.attrs('Plan');

    let response = await request(app)
      .post('/plans')
      .set('Authorization', `bearer ${token}`)
      .send(plan);

    expect(response.status).toBe(200);

    const planWithExistingTitle = { ...response.body };

    response = await request(app)
      .post('/plans')
      .set('Authorization', `bearer ${token}`)
      .send(planWithExistingTitle);

    expect(response.status).toBe(400);
  });
});
