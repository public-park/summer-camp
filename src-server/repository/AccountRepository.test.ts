require('dotenv').config();

import { Account } from '../models/Account';
import { init, corporations, accountRepository as accounts } from '../test/test-environment';
import { InvalidAccountNameException } from '../exceptions/InvalidAccountNameException';

init();

describe('Account Repository create', () => {
  test('should create an account ', async (done) => {
    const account = await accounts.create(corporations.acme);

    expect(account).toBeInstanceOf(Account);
    expect(account.id).toHaveLength(36);
    expect(account.name).toBe(corporations.acme);
    expect(account.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should fail to create an account with an empty name', async (done) => {
    await expect(accounts.create('')).rejects.toThrow(InvalidAccountNameException);

    done();
  });
});

describe('Account Repository read, update and delete an account', () => {
  let id: string;
  let name: string;

  beforeAll(async (done) => {
    const account = await accounts.create(corporations.mom);

    id = account.id;
    name = account.name;

    done();
  });

  test('should read an account by id', async (done) => {
    const account = <Account>await accounts.getById(id);

    expect(account).toBeInstanceOf(Account);
    expect(account.id).toHaveLength(36);
    expect(account.name).toBe(corporations.mom);
    expect(account.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should read an account by unique name', async (done) => {
    const account = (await accounts.getByName(name))[0];

    expect(account).toBeInstanceOf(Account);
    expect(account?.id).toHaveLength(36);
    expect(account?.name).toBe(corporations.mom);
    expect(account?.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should save the account and return the updated object', async (done) => {
    let account = <Account>await accounts.getById(id);

    account.name = corporations.wonka;

    account = <Account>await accounts.save(<Account>account);

    expect(account).toBeInstanceOf(Account);
    expect(account.name).toBe(corporations.wonka);

    done();
  });

  test('should read the account and has updated name', async (done) => {
    let account = <Account>await accounts.getById(id);

    expect(account).toBeInstanceOf(Account);
    expect(account.name).toBe(corporations.wonka);

    done();
  });

  test('should delete the account', async (done) => {
    const account = await accounts.getById(id);

    await expect(accounts.remove(<Account>account)).resolves.toBeUndefined();

    done();
  });

  test('should fail to delete a account that does not exist', async (done) => {
    const account = await accounts.getById(id);

    await expect(accounts.remove(<Account>account)).rejects.toThrow();

    done();
  });

  test('should fail to read an account that does not exist and return undefined', async (done) => {
    await expect(accounts.getById(id)).resolves.toBeUndefined();

    done();
  });
});
