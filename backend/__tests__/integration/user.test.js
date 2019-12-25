import request from 'supertest';
import bcrypt from 'bcryptjs';
import app from '../../src/app';

import factory from '../factories';
import truncate from '../util/truncate';

describe('User - create', () => {
  beforeEach(async () => {
    await truncate();
  });

  it('should encrypt user password when creating new user', async () => {
    const user = await factory.create('User', {
      password: '123456',
    });

    const compareHash = await bcrypt.compare('123456', user.password_hash);

    expect(compareHash).toBe(true);
  });

  it('should be able to register', async () => {
    const user = await factory.attrs('User');

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to register with duplicated email', async () => {
    const user = await factory.attrs('User');

    await request(app)
      .post('/users')
      .send(user);

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register with missing name', async () => {
    const user = await factory.attrs('User');
    delete user.name;

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register with invalid email', async () => {
    const user = await factory.attrs('User', {
      email: 'invalid_email',
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });

  it('should not be able to register with invalid password', async () => {
    const user = factory.attrs('User', {
      password: '123',
    });

    const response = await request(app)
      .post('/users')
      .send(user);

    expect(response.status).toBe(400);
  });
});

describe('User - update', () => {
  let token;
  let user;

  beforeEach(async () => {
    await truncate();
    user = await factory.create('User');

    const response = await request(app)
      .post('/sessions')
      .send({
        email: user.email,
        password: user.password,
      });

    token = response.body.token;
  });

  it('should be able to update name', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        name: 'another_name',
      });

    expect(user.name).not.toBe('another_name');
    expect(response.body.name).toBe('another_name');
  });

  it('should be able to update email', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        email: 'another_email@test.com',
      });

    expect(user.email).not.toBe('another_email@test.com');
    expect(response.status).toBe(200);
    expect(response.body.email).toBe('another_email@test.com');
  });

  it('should not be able to update email due to already existing email', async () => {
    const anotherUser = await factory.create('User');

    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        email: anotherUser.email,
      });

    expect(user.email).not.toBe(anotherUser.email);
    expect(response.status).toBe(400);
  });

  it('should not be able to update with invalid email', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        email: 'invalid_email',
      });

    expect(response.status).toBe(400);
  });

  it('should update password', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        oldPassword: user.password,
        password: '12345678',
        confirmPassword: '12345678',
      });

    expect(response.status).toBe(200);
  });

  it('should not update due to invalid password', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        oldPassword: `${user.password}_invalid`,
        password: '12345678',
        confirmPassword: '12345678',
      });

    expect(response.status).toBe(401);
  });

  it('should not update due to mismatch between password and confirmPassword', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        oldPassword: user.password,
        password: '12345678',
        confirmPassword: 'abcdefgh',
      });

    expect(response.status).toBe(400);
  });

  it('should not update due to missing password', async () => {
    const response = await request(app)
      .put('/users')
      .set('Authorization', `bearer ${token}`)
      .send({
        oldPassword: user.password,
        confirmPassword: 'abcdefgh',
      });

    expect(response.status).toBe(400);
  });
});
