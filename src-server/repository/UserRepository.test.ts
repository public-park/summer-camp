require('dotenv').config();

import { User } from '../models/User';
import { Account } from '../models/Account';
import { UserActivity } from '../models/UserActivity';
import { UserRole } from '../models/UserRole';
import {
  init,
  personas,
  accountRepository,
  authenticationProvider,
  userRepository,
  secret,
  corporations,
} from '../test/test-environment';
import { InvalidUserNameException } from '../exceptions/InvalidUserNameException';

init();

describe('User Repository create', () => {
  let account: any;
  let authentication: any;

  beforeAll(async (done) => {
    account = await accountRepository.create(`${personas.alice}'s Account`);
    authentication = await authenticationProvider.create(secret);

    done();
  });

  test('should create a new user ', async (done) => {
    const user = await userRepository.create(
      personas.alice,
      undefined,
      new Set(['es', 'jp']),
      account,
      authentication,
      UserRole.Owner
    );

    expect(user).toBeInstanceOf(User);
    expect(user.id).toHaveLength(36);
    expect(user.name).toBe(personas.alice);
    expect(user.profileImageUrl).toBeUndefined();
    expect(user.tags).toBeInstanceOf(Set);
    expect(user.tags.size).toBe(2);
    expect(user.tags.has('es')).toBeTruthy();
    expect(user.tags.has('jp')).toBeTruthy();
    expect(user.account).toBeInstanceOf(Account);
    expect(user.account.id).toHaveLength(36);
    expect(user.authentication).toBeDefined();
    expect(user.role).toBe(UserRole.Owner);
    expect(user.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should fail to create a user with the same name', async (done) => {
    await expect(
      userRepository.create(personas.alice, undefined, new Set(['es', 'jp']), account, authentication, UserRole.Owner)
    ).rejects.toThrow();

    done();
  });

  test('should fail to create a user without name', async (done) => {
    await expect(
      userRepository.create('', undefined, new Set(['es', 'jp']), account.id, authentication, UserRole.Owner)
    ).rejects.toThrow(InvalidUserNameException);

    done();
  });
});

describe('User Repository read, update and delete a user', () => {
  let id: string;
  let name: string;
  let account: any;

  beforeAll(async (done) => {
    account = await accountRepository.create(`${personas.joe}'s Account`);
    const authentication = await authenticationProvider.create(secret);

    const user = await userRepository.create(
      personas.joe,
      undefined,
      new Set(['es', 'jp']),
      account,
      authentication,
      UserRole.Owner
    );

    id = user.id;
    name = user.name;

    done();
  });

  test('should read a user by id', async (done) => {
    const user = <User>await userRepository.getById(account, id);

    expect(user).toBeInstanceOf(User);
    expect(user.id).toHaveLength(36);
    expect(user.name).toBe(personas.joe);
    expect(user.profileImageUrl).toBeUndefined();
    expect(user.tags).toBeInstanceOf(Set);
    expect(user.tags.size).toBe(2);
    expect(user.tags.has('es')).toBeTruthy();
    expect(user.tags.has('jp')).toBeTruthy();
    expect(user.account).toBeInstanceOf(Account);
    expect(user.authentication).toBeDefined();
    expect(user.role).toBe(UserRole.Owner);
    expect(user.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should read the a user by name', async (done) => {
    const account = await userRepository.getByName(name);

    expect(account).toBeInstanceOf(User);

    done();
  });

  test('should update the user and return the updated object', async (done) => {
    let user = <User>await userRepository.getById(account, id);

    user.name = personas.max;
    user.profileImageUrl = 'joe.png';
    user.tags.add('engineer');
    user.tags.add('de');

    user = <User>await userRepository.update(account, user);

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe(personas.max);
    expect(user.profileImageUrl).toBe('joe.png');
    expect(user.tags.size).toBe(4);
    expect(user.tags.has('engineer')).toBeTruthy();
    expect(user.tags.has('de')).toBeTruthy();

    done();
  });

  test("should remove the user's tags", async (done) => {
    let user = <User>await userRepository.getById(account, id);

    user.tags.clear();

    user = <User>await userRepository.update(account, user);

    expect(user.name).toBe(personas.max);
    expect(user.tags.size).toBe(0);

    done();
  });

  test('should fail to set the user name if a user with the same name already exists', async (done) => {
    let max = <User>await userRepository.getById(account, id);

    max.name = personas.alice;

    await expect(userRepository.update(account, max)).rejects.toThrow();

    done();
  });

  test('should fail to change the account of a user', async (done) => {
    let alice = <User>await userRepository.getById(account, id);

    const wonka = await accountRepository.create(corporations.acme);

    alice.account = wonka;

    await expect(userRepository.update(account, <User>alice)).rejects.toThrow();

    done();
  });

  test('should fail to set the user name to an empty value', async (done) => {
    let alice = <User>await userRepository.getById(account, id);

    alice.name = '';

    await expect(userRepository.update(account, <User>alice)).rejects.toThrow();

    done();
  });
});

describe('User Repository read users', () => {
  let account: any;
  let authentication: any;

  beforeAll(async (done) => {
    account = await accountRepository.create(`${personas.jane}'s Account`);

    authentication = await authenticationProvider.create(secret);

    done();
  });

  test('should return all users from the repository', async (done) => {
    await userRepository.create(
      personas.julia,
      undefined,
      new Set(['es', 'jp']),
      account,
      authentication,
      UserRole.Owner
    );

    await userRepository.create(
      personas.tim,
      undefined,
      new Set(['es', 'jp']),
      account,
      authentication,
      UserRole.Owner
    );

    let users = await userRepository.getAll(account);

    expect(users).toHaveLength(2);
    expect(users[0]).toBeInstanceOf(User);

    done();
  });
});

describe('User Repository delete', () => {
  let id: string;
  let account: any;

  beforeAll(async (done) => {
    account = await accountRepository.create(`${personas.bob}'s Account`);
    const authentication = await authenticationProvider.create(secret);

    const user = await userRepository.create(
      personas.bob,
      undefined,
      new Set(['es', 'jp']),
      account,
      authentication,
      UserRole.Owner
    );

    id = user.id;

    done();
  });

  test('should delete a user', async (done) => {
    const bob = <User>await userRepository.getById(account, id);

    await expect(userRepository.delete(account, bob)).resolves.toBeUndefined();

    done();
  });

  test('should faild to read a user that does not exist an return undefined', async (done) => {
    await expect(userRepository.getById(account, id)).resolves.toBeUndefined();

    done();
  });
});

describe('user activities', () => {
  let user: any;

  beforeAll(async (done) => {
    user = await userRepository.getByName(personas.max);

    done();
  });

  test('should find the default activity', async (done) => {
    expect(user.activity).toBe(UserActivity.Unknown);

    done();
  });

  test('should set activity', async (done) => {
    user.activity = UserActivity.WaitingForWork;

    await userRepository.update(user.account, user);

    expect(user.activity).toBe(UserActivity.WaitingForWork);

    done();
  });
});
