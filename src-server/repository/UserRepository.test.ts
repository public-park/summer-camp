require('dotenv').config();

import { User } from '../models/User';
import { UserActivity } from '../models/UserActivity';
import { UserRole } from '../models/UserRole';
import {
  init,
  personas,
  accountRepository as accounts,
  authenticationProvider,
  userRepository as users,
  secret,
  corporations,
} from '../test/test-environment';
import { InvalidUserNameException } from '../exceptions/InvalidUserNameException';

init();

describe('User Repository create', () => {
  let account: any;
  let authentication: any;

  beforeAll(async (done) => {
    account = await accounts.create(`${personas.alice}'s Account`);
    authentication = await authenticationProvider.create(secret);

    done();
  });

  test('should create a new user ', async (done) => {
    const user = await users.create(
      personas.alice,
      undefined,
      new Set(['es', 'jp']),
      account.id,
      authentication,
      UserRole.Owner,
      undefined
    );

    expect(user).toBeInstanceOf(User);
    expect(user.id).toHaveLength(36);
    expect(user.name).toBe(personas.alice);
    expect(user.profileImageUrl).toBeUndefined();
    expect(user.tags).toBeInstanceOf(Set);
    expect(user.tags.size).toBe(2);
    expect(user.tags.has('es')).toBeTruthy();
    expect(user.tags.has('jp')).toBeTruthy();
    expect(user.accountId).toHaveLength(36);
    expect(user.authentication).toBeDefined();
    expect(user.role).toBe(UserRole.Owner);
    expect(user.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should fail to create a user with the same name', async (done) => {
    expect(
      users.create(
        personas.alice,
        undefined,
        new Set(['es', 'jp']),
        account.id,
        authentication,
        UserRole.Owner,
        undefined,
        undefined
      )
    ).rejects.toThrow();

    done();
  });

  test('should fail to create a user without name', async (done) => {
    expect(
      users.create('', undefined, new Set(['es', 'jp']), account, authentication, UserRole.Owner, undefined, undefined)
    ).rejects.toThrow(InvalidUserNameException);

    done();
  });
});

describe('User Repository read, update and delete a user', () => {
  let id: string;
  let name: string;
  let account: any;

  beforeAll(async (done) => {
    account = await accounts.create(`${personas.joe}'s Account`);
    const authentication = await authenticationProvider.create(secret);

    const user = await users.create(
      personas.joe,
      undefined,
      new Set(['es', 'jp']),
      account.id,
      authentication,
      UserRole.Owner,
      UserActivity.Unknown
    );

    id = user.id;
    name = user.name;

    done();
  });

  test('should read a user by id', async (done) => {
    const user = <User>await users.getById(id);

    expect(user).toBeInstanceOf(User);
    expect(user.id).toHaveLength(36);
    expect(user.name).toBe(personas.joe);
    expect(user.profileImageUrl).toBeUndefined();
    expect(user.tags).toBeInstanceOf(Set);
    expect(user.tags.size).toBe(2);
    expect(user.tags.has('es')).toBeTruthy();
    expect(user.tags.has('jp')).toBeTruthy();
    expect(user.accountId).toHaveLength(36);
    expect(user.authentication).toBeDefined();
    expect(user.role).toBe(UserRole.Owner);
    expect(user.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should read the user by name', async (done) => {
    const user = await users.getByName(name);

    expect(user).toBeInstanceOf(User);

    done();
  });

  test('should update the user and return the updated object', async (done) => {
    let user = <User>await users.getById(id);

    user.name = personas.max;
    user.profileImageUrl = 'joe.png';
    user.tags.add('engineer');
    user.tags.add('de');

    user = <User>await users.save(user);

    expect(user).toBeInstanceOf(User);
    expect(user.name).toBe(personas.max);
    expect(user.profileImageUrl).toBe('joe.png');
    expect(user.tags.size).toBe(4);
    expect(user.tags.has('engineer')).toBeTruthy();
    expect(user.tags.has('de')).toBeTruthy();

    done();
  });

  test("should remove the user's tags", async (done) => {
    let user = <User>await users.getById(id);

    user.tags.clear();

    user = await users.save(user);

    expect(user.name).toBe(personas.max);
    expect(user.tags.size).toBe(0);

    done();
  });

  test('should fail to set the user name if a user with the same name already exists', async (done) => {
    let max = <User>await users.getById(id);

    max.name = personas.alice;

    await expect(users.save(max)).rejects.toThrow();

    done();
  });

  test('should fail to change the account of a user', async (done) => {
    let alice = <User>await users.getById(id);

    const wonka = await accounts.create(`${corporations.acme}'s Account`);

    alice.accountId = wonka.id;

    await expect(users.save(<User>alice)).rejects.toThrow();

    done();
  });

  test('should fail to set the user name to an empty value', async (done) => {
    let alice = <User>await users.getById(id);

    alice.name = '';

    await expect(users.save(<User>alice)).rejects.toThrow();

    done();
  });
});

describe('User Repository read users', () => {
  let account: any;
  let authentication: any;

  beforeAll(async (done) => {
    account = await accounts.create(`${personas.jane}'s Account`);

    authentication = await authenticationProvider.create(secret);

    done();
  });

  test('should return all users from the repository', async (done) => {
    await users.create(personas.julia, undefined, new Set(['es', 'jp']), account.id, authentication, UserRole.Owner);
    await users.create(personas.tim, undefined, new Set(['es', 'jp']), account.id, authentication, UserRole.Agent);
    await users.create(
      `${personas.julia}-ng`,
      undefined,
      new Set(['es', 'jp']),
      account.id,
      authentication,
      UserRole.Agent
    );

    let list = await users.getAll(account);

    expect(list).toHaveLength(3);
    expect(list[0]).toBeInstanceOf(User);

    done();
  });

  test('should return users from the repository and skip the first entry', async (done) => {
    let list = await users.getAll(account, 1);

    expect(list).toHaveLength(2);
    done();
  });

  test('should return users from the repository and limit the results', async (done) => {
    let list = await users.getAll(account, 0, 1);

    expect(list).toHaveLength(1);
    done();
  });
});

describe('User Repository delete', () => {
  let id: string;
  let account: any;

  beforeAll(async (done) => {
    account = await accounts.create(`${personas.bob}'s Account`);

    const authentication = await authenticationProvider.create(secret);

    const user = await users.create(
      personas.bob,
      undefined,
      new Set(['es', 'jp']),
      account.id,
      authentication,
      UserRole.Owner,
      UserActivity.Unknown
    );

    id = user.id;

    done();
  });

  test('should delete a user', async (done) => {
    const bob = <User>await users.getById(id);

    await expect(users.remove(bob)).resolves.toBeUndefined();

    done();
  });

  test('should faild to read a user that does not exist an return undefined', async (done) => {
    await expect(users.getById(id)).resolves.toBeUndefined();

    done();
  });
});

describe('user activities', () => {
  let user: any;

  beforeAll(async (done) => {
    const account = await accounts.create(`${personas.eva}'s Account`);

    const authentication = await authenticationProvider.create(secret);

    user = await users.create(
      personas.eva,
      undefined,
      new Set(['es', 'jp']),
      account.id,
      authentication,
      UserRole.Owner,
      UserActivity.Away
    );

    done();
  });

  test('should find the default activity', async (done) => {
    expect(user.activity).toBe(UserActivity.Away);

    done();
  });

  test('should set activity', async (done) => {
    user.activity = UserActivity.WaitingForWork;

    await users.save(user);

    expect(user.activity).toBe(UserActivity.WaitingForWork);

    done();
  });
});
