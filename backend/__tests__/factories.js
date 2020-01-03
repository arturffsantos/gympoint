import faker from 'faker';
import { factory } from 'factory-girl';
import User from '../src/app/models/User';
import Student from '../src/app/models/Student';
import Plan from '../src/app/models/Plan';

factory.define('User', User, {
  name: () => faker.name.findName(),
  email: () => faker.internet.email(),
  password: () => faker.internet.password(),
});

factory.define('Student', Student, {
  name: () => faker.name.findName(),
  email: () => faker.internet.email(),
  age: () => Math.trunc(faker.random.number({ min: 10, max: 99 })),
  weight: () => faker.random.number({ min: 10, max: 250, precision: 1 }),
  height: () => Math.trunc(faker.random.number({ min: 100, max: 250 })),
});

factory.define('Plan', Plan, {
  title: () => faker.commerce.productAdjective(),
  duration: () => Math.trunc(faker.random.number({ min: 1, max: 12 })),
  price: () => Math.trunc(faker.random.number({ min: 10, max: 250 })),
});

export default factory;
