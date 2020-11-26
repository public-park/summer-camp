import * as mongoose from 'mongoose';
import { MongoAccountRepository } from '../repository/mongo/MongoAccountRepository';
import { MongoUserRepository } from '../repository/mongo/MongoUserRepository';
import { PasswordAuthenticationProvider } from '../security/authentication/PasswordAuthenticationProvider';
import { FileUserRepository } from '../repository/file/FileUserRepository';
import { FileAccountRepository } from '../repository/file/FileAccountRepository';
import { FileCallRepository } from '../repository/file/FileCallRepository';
import { MongoCallRepository } from '../repository/mongo/MongoCallRepository';

/* MongoDB */
const uri = `mongodb://localhost:27017/summer-camp-test`;

const mongoOptions = {
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

export const accountRepository = new MongoAccountRepository('accounts-test');
export const userRepository = new MongoUserRepository('users-test');
export const callRepository = new MongoCallRepository('calls-test');
export const authenticationProvider = new PasswordAuthenticationProvider();

export const init = () => {
  let connection: typeof mongoose;

  beforeAll(async () => {
    connection = await mongoose.connect(uri, mongoOptions);
  });

  afterAll(async () => {
    await accountRepository.getModel().deleteMany({});
    await userRepository.getModel().deleteMany({});
    await callRepository.getModel().deleteMany({});

    await connection.disconnect();
  });
};

/* File Storage 

export const accountRepository = new FileAccountRepository('./src-server/test/accounts-test.json');
export const userRepository = new FileUserRepository(accountRepository, './src-server/test/users-test.json');
export const callRepository = new FileCallRepository('./src-server/test/calls-test.json');
export const authenticationProvider = new PasswordAuthenticationProvider();

export const init = () => {
  beforeAll(async () => {});

  afterAll(async () => {
    await accountRepository.empty();
    await userRepository.empty();
    await callRepository.empty();
  });
};
*/
export const corporations = {
  mom: 'MomCorp',
  wonka: 'Wonka Industries',
  acme: 'Acme Corporation',
  good: 'Good Burger',
};

export const personas = {
  bob: 'Bob the Builder',
  alice: 'Alice the Magician',
  joe: 'Joe the Engineer',
  max: 'Max the Astronaut',
  jane: 'Jane the Engineer',
  tim: 'Tim the Explorer',
  julia: 'Julia the Entrepreneur',
  eva: 'Eva the Engineer',
};

export const secret = 'my-secret-password';
