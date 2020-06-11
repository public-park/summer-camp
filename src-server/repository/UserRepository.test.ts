require('dotenv').config();

import { User } from '../models/User';
import { UserNameError } from './UserNameError';
import { UserActivity } from '../models/UserActivity';
import {
  init,
  personas,
  accountRepository,
  authenticationProvider,
  userRepository,
  secret,
} from '../test/test-environment';

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
      account.id,
      new Set([]),
      authentication
    );

    expect(user).toBeInstanceOf(User);
    expect(user.id).toHaveLength(36);
    expect(user.name).toBe(personas.alice);
    expect(user.profileImageUrl).toBeUndefined();
    expect(user.labels).toBeInstanceOf(Set);
    expect(user.labels.size).toBe(2);
    expect(user.labels.has('es')).toBeTruthy();
    expect(user.labels.has('jp')).toBeTruthy();
    expect(user.accountId).toHaveLength(36);
    expect(user.permissions).toBeInstanceOf(Set);
    expect(user.permissions.size).toBe(0);
    expect(user.authentication).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should fail to create a user with the same name', async (done) => {
    await expect(
      userRepository.create(personas.alice, undefined, new Set(['es', 'jp']), account.id, new Set([]), authentication)
    ).rejects.toThrow();

    done();
  });

  test('should fail to create a user without name', async (done) => {
    await expect(
      userRepository.create('', undefined, new Set(['es', 'jp']), account.id, new Set([]), authentication)
    ).rejects.toThrow(UserNameError);

    done();
  });

  test('should fail to create a user without accountId', async (done) => {
    await expect(
      userRepository.create(personas.bob, undefined, new Set(['es', 'jp']), '', new Set([]), authentication)
    ).rejects.toThrow();

    done();
  });

  test('should fail to create a user without valid accountId', async (done) => {
    await expect(
      userRepository.create(
        personas.bob,
        undefined,
        new Set(['es', 'jp']),
        account.id.substr(0, 1),
        new Set([]),
        authentication
      )
    ).rejects.toThrow();

    done();
  });
});

describe('User Repository read, update and delete a user', () => {
  let id: string;
  let name: string;

  beforeAll(async (done) => {
    const account = await accountRepository.create(`${personas.joe}'s Account`);
    const authentication = await authenticationProvider.create(secret);

    const user = await userRepository.create(
      personas.joe,
      undefined,
      new Set(['es', 'jp']),
      account.id,
      new Set([]),
      authentication
    );

    id = user.id;
    name = user.name;

    done();
  });

  test('should read a user by id', async (done) => {
    const user = <User>await userRepository.getById(id);

    expect(user).toBeInstanceOf(User);
    expect(user.id).toHaveLength(36);
    expect(user.name).toBe(personas.joe);
    expect(user.profileImageUrl).toBeUndefined();
    expect(user.labels).toBeInstanceOf(Set);
    expect(user.labels.size).toBe(2);
    expect(user.labels.has('es')).toBeTruthy();
    expect(user.labels.has('jp')).toBeTruthy();
    expect(user.accountId).toHaveLength(36);
    expect(user.permissions).toBeInstanceOf(Set);
    expect(user.permissions.size).toBe(0);
    expect(user.authentication).toBeDefined();
    expect(user.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should read the a user by name', async (done) => {
    const account = await userRepository.getByName(name);

    expect(account).toBeInstanceOf(User);

    done();
  });

  test('should update the user and return the updated object', async (done) => {
    let user = <User>await userRepository.getById(id);

    user.name = personas.max;
    user.profileImageUrl = 'joe.png';
    user.labels.add('engineer');
    user.labels.add('de');
    user.permissions.add('user.create');
    user.permissions.add('user.update');

    user = <User>await userRepository.update(user);

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe(personas.max);
    expect(user.profileImageUrl).toBe('joe.png');
    expect(user.labels.size).toBe(4);
    expect(user.labels.has('engineer')).toBeTruthy();
    expect(user.labels.has('de')).toBeTruthy();
    expect(user.permissions.size).toBe(2);
    expect(user.permissions.has('user.create')).toBeTruthy();
    expect(user.permissions.has('user.update')).toBeTruthy();

    done();
  });

  test("should remove the user's labels and permissions", async (done) => {
    let user = <User>await userRepository.getById(id);

    user.labels.clear();
    user.permissions.clear();

    user = <User>await userRepository.update(user);

    expect(user.name).toBe(personas.max);
    expect(user.labels.size).toBe(0);
    expect(user.permissions.size).toBe(0);

    done();
  });

  test('should fail to set the user name if a user with the same name already exists', async (done) => {
    let alice = <User>await userRepository.getById(id);

    alice.name = personas.alice;

    await expect(userRepository.update(alice)).rejects.toThrow();

    done();
  });

  test('should validate the accountSid', async (done) => {
    let alice = <User>await userRepository.getById(id);

    alice.accountId = alice.accountId.substr(0, 1);

    await expect(userRepository.update(<User>alice)).rejects.toThrow();

    done();
  });

  test('should fail to set the user name to an empty value', async (done) => {
    let alice = <User>await userRepository.getById(id);

    alice.name = '';

    await expect(userRepository.update(<User>alice)).rejects.toThrow();

    done();
  });
});

describe('User Repository read users', () => {
  test('should return all users from the repository', async (done) => {
    let users = await userRepository.getAll();

    expect(users).toHaveLength(2);
    expect(users[0]).toBeInstanceOf(User);

    done();
  });
});

describe('User Repository delete', () => {
  let id: string;

  beforeAll(async (done) => {
    const account = await accountRepository.create(`${personas.bob}'s Account`);
    const authentication = await authenticationProvider.create(secret);

    const user = await userRepository.create(
      personas.bob,
      undefined,
      new Set(['es', 'jp']),
      account.id,
      new Set([]),
      authentication
    );

    id = user.id;

    done();
  });

  test('should delete a user', async (done) => {
    const bob = <User>await userRepository.getById(id);

    await expect(userRepository.delete(bob)).resolves.toBeUndefined();

    done();
  });

  test('should faild to read a user that does not exist an return undefined', async (done) => {
    await expect(userRepository.getById(id)).resolves.toBeUndefined();

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

    await userRepository.update(user);

    expect(user.activity).toBe(UserActivity.WaitingForWork);

    done();
  });
});
