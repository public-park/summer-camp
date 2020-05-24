require('dotenv').config();

import { Account } from '../models/Account';
import { AccountNameError } from './AccountNameError';
import { init, corporations, accountRepository } from '../test/test-environment';

init();

describe('create an account', () => {
  test('should create an account ', async (done) => {
    const account = await accountRepository.create(corporations.acme);

    expect(account).toBeInstanceOf(Account);
    expect(account.id).toHaveLength(36);
    expect(account.name).toBe(corporations.acme);
    expect(account.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should fail to create an account with the same name', async (done) => {
    await expect(accountRepository.create(corporations.acme)).rejects.toThrow();

    done();
  });

  test('should fail to create an account without name', async (done) => {
    await expect(accountRepository.create('')).rejects.toThrow(AccountNameError);

    done();
  });
});

describe('read, update and delete an account', () => {
  let id: string;
  let name: string;

  beforeAll(async (done) => {
    const account = await accountRepository.create(corporations.mom);

    id = account.id;
    name = account.name;

    done();
  });

  test('should read the account by id', async (done) => {
    const account = <Account>await accountRepository.getById(id);

    expect(account).toBeInstanceOf(Account);
    expect(account.id).toHaveLength(36);
    expect(account.name).toBe(corporations.mom);
    expect(account.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('should read the account by name', async (done) => {
    const account = await accountRepository.getByName(name);

    expect(account).toBeInstanceOf(Account);
    expect(account?.id).toHaveLength(36);
    expect(account?.name).toBe(corporations.mom);
    expect(account?.createdAt).toBeInstanceOf(Date);

    done();
  });

  test('update the account returns the account object with update name', async (done) => {
    let account = <Account>await accountRepository.getById(id);

    account.name = corporations.wonka;

    account = <Account>await accountRepository.update(<Account>account);

    expect(account).toBeInstanceOf(Account);
    expect(account.name).toBe(corporations.wonka);

    done();
  });

  test('reading an update account returns the update value', async (done) => {
    let account = <Account>await accountRepository.getById(id);

    expect(account).toBeInstanceOf(Account);
    expect(account.name).toBe(corporations.wonka);

    done();
  });

  test('should delete the account', async (done) => {
    const account = await accountRepository.getById(id);

    await expect(accountRepository.delete(<Account>account)).resolves.toBeUndefined();

    done();
  });

  test('should throw on deleting an non existing account', async (done) => {
    const account = await accountRepository.getById(id);

    await expect(accountRepository.delete(<Account>account)).rejects.toThrow();

    done();
  });

  test('read an non existing account should return undefined', async (done) => {
    await expect(accountRepository.getById(id)).resolves.toBeUndefined();

    done();
  });

  test('read all users from database', async () => {
    await accountRepository.create(corporations.wonka);
    await accountRepository.create(corporations.good);

    expect(await accountRepository.getAll()).toHaveLength(3);
  });

  test('delete two accounts', async () => {
    await accountRepository.delete(<Account>await accountRepository.getByName(corporations.wonka));
    await accountRepository.delete(<Account>await accountRepository.getByName(corporations.good));

    expect(await accountRepository.getAll()).toHaveLength(1);
  });
});
