import * as mongoose from 'mongoose';
import AccountModel from '../repository/mongo/AccountSchema';
import UserModel from '../repository/mongo/UserSchema';
import { MongoAccountRepository } from '../repository/mongo/MongoAccountRepository';
import { MongoUserRepository } from '../repository/mongo/MongoUserRepository';
import { PasswordAuthenticationProvider } from '../security/authentication/PasswordAuthenticationProvider';
import { FileUserRepository } from '../repository/file/FileUserRepository';
import { FileAccountRepository } from '../repository/file/FileAccountRepository';

/* MongoDB 
const uri = `mongodb://localhost:27017/summer-camp-test`;

const mongoOptions = {
  useFindAndModify: false,
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
};

export const accountRepository = new MongoAccountRepository();
export const userRepository = new MongoUserRepository();
export const authenticationProvider = new PasswordAuthenticationProvider();

export const init = () => {
  let connection: typeof mongoose;

  beforeAll(async () => {
    connection = await mongoose.connect(uri, mongoOptions);
  });

  afterAll(async () => {
    await AccountModel.deleteMany({});
    await UserModel.deleteMany({});

    await connection.disconnect();
  });
}; */

/* File Storage */
export const accountRepository = new FileAccountRepository('./tests/accounts-test.json');
export const userRepository = new FileUserRepository('./tests/users-test.json', accountRepository);

export const authenticationProvider = new PasswordAuthenticationProvider();

export const init = () => {
  let connection: typeof mongoose;

  beforeAll(async () => {});

  afterAll(async () => {
    await accountRepository.empty();
    await userRepository.empty();
  });
};

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
};

export const secret = 'my-secret-password';
