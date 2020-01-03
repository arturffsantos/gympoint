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

describe('Plan - list', () => {
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

  it('should list all plans', async () => {
    await Promise.all([
      factory.create('Plan'),
      factory.create('Plan'),
      factory.create('Plan'),
    ]);

    const response = await request(app)
      .get('/plans')
      .set('Authorization', `bearer ${token}`);

    expect(response.body.length).toBe(3);
  });
});

describe('Plan - update', () => {
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

  it('should be able to update title', async () => {
    const plan = await factory.create('Plan');
    const response = await request(app)
      .put(`/plans/${plan.id}`)
      .set('Authorization', `bearer ${token}`)
      .send({
        title: 'new_plan_title',
      });

    expect(plan.title).not.toBe('new_plan_title');
    expect(response.body.title).toBe('new_plan_title');
  });

  it('should be able to update duration', async () => {
    const plan = await factory.create('Plan');
    const newDuration = plan.duration + 1;
    const response = await request(app)
      .put(`/plans/${plan.id}`)
      .set('Authorization', `bearer ${token}`)
      .send({
        duration: newDuration,
      });

    expect(plan.duration).not.toBe(newDuration);
    expect(response.body.duration).toBe(newDuration);
  });

  it('should be able to update price', async () => {
    const plan = await factory.create('Plan');
    const newPrice = plan.price * 1.1;
    const response = await request(app)
      .put(`/plans/${plan.id}`)
      .set('Authorization', `bearer ${token}`)
      .send({
        price: newPrice,
      });

    expect(plan.price).not.toBe(newPrice);
    expect(response.body.price).toBe(newPrice);
  });

  it('should not be able to update due to existing title', async () => {
    const plans = await Promise.all([
      factory.create('Plan'),
      factory.create('Plan'),
    ]);

    const response = await request(app)
      .put(`/plans/${plans[0].id}`)
      .set('Authorization', `bearer ${token}`)
      .send({
        title: plans[1].title,
      });

    expect(plans[0].title).not.toBe(plans[1].title);
    expect(response.status).toBe(400);
  });

  it('should not be able to update due to plan not found', async () => {
    const plan = await factory.create('Plan');
    const newPrice = plan.price * 1.1;
    const response = await request(app)
      .put(`/plans/999`)
      .set('Authorization', `bearer ${token}`)
      .send({
        price: newPrice,
      });

    expect(response.status).toBe(404);
  });
});
