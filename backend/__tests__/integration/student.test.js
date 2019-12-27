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

describe('Student - list', () => {
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

  it('should list all students', async () => {
    await Promise.all([
      factory.create('Student'),
      factory.create('Student'),
      factory.create('Student'),
    ]);

    const response = await request(app)
      .get('/students')
      .set('Authorization', `bearer ${token}`);

    expect(response.body.length).toBe(3);
  });
});

describe('Student - update', () => {
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

  it('should be able to update name', async () => {
    const student = await factory.create('Student');
    const response = await request(app)
      .put(`/students/${student.id}`)
      .set('Authorization', `bearer ${token}`)
      .send({
        name: 'another_name',
      });

    expect(student.name).not.toBe('another_name');
    expect(response.body.name).toBe('another_name');
  });
});
