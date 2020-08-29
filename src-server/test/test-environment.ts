import * as mongoose from 'mongoose';
import AccountModel from '../repository/mongo/AccountSchema';
import UserModel from '../repository/mongo/UserSchema';
import { MongoAccountRepository } from '../repository/mongo/MongoAccountRepository';
import { MongoUserRepository } from '../repository/mongo/MongoUserRepository';
import { PasswordAuthenticationProvider } from '../security/authentication/PasswordAuthenticationProvider';
import { FileUserRepository } from '../repository/file/FileUserRepository';
import { FileAccountRepository } from '../repository/file/FileAccountRepository';
import { FileCallRepository } from '../repository/file/FileCallRepository';
import { MongoCallRepository } from '../repository/mongo/MongoCallRepository';
import CallModel from '../repository/mongo/CallSchema';

/* MongoDB */
const uri = `mongodb://localhost:27017/summer-camp-test`;

const mongoOptions = {
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

export const accountRepository = new MongoAccountRepository();
export const userRepository = new MongoUserRepository(accountRepository);
export const callRepository = new MongoCallRepository();
export const authenticationProvider = new PasswordAuthenticationProvider();

export const init = () => {
  let connection: typeof mongoose;

  beforeAll(async () => {
    connection = await mongoose.connect(uri, mongoOptions);
  });

  afterAll(async () => {
    await AccountModel.deleteMany({});
    await UserModel.deleteMany({});
    await CallModel.deleteMany({});

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
};

export const secret = 'my-secret-password';
