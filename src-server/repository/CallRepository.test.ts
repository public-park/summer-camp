require('dotenv').config();

import {
  init,
  personas,
  accountRepository as accounts,
  callRepository as calls,
  authenticationProvider,
  userRepository,
  secret,
  corporations,
} from '../test/test-environment';
import { CallStatus } from '../models/CallStatus';
import { CallDirection } from '../models/CallDirection';
import { Call } from '../models/Call';
import { UserRole } from '../models/UserRole';

init();

const generateCallSid = () => {
  return `C${Math.random().toString(6).slice(2)}`;
};

const generatePhoneNumber = () => {
  return `+1${Math.round(Math.random() * 10)}`;
};

describe('Call Repository create, update', () => {
  let account: any;
  let authentication: any;
  let user: any;

  beforeAll(async (done) => {
    account = await accounts.create(`${personas.alice}'s Account`);

    accounts.save(account);

    authentication = await authenticationProvider.create(secret);

    user = await userRepository.create(
      personas.alice,
      undefined,
      new Set(['es', 'jp']),
      account,
      authentication,
      UserRole.Owner,
      undefined,
      undefined
    );

    userRepository.save(user);

    done();
  });

  test('should create a call and set all values', async (done) => {
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    let call = await calls.create(account, from, to, CallDirection.Inbound, CallStatus.Ringing, user);

    expect(call).toBeInstanceOf(Call);
    expect(call.from).toBe(from);
    expect(call.to).toBe(to);
    expect(call.accountId).toBe(account.id);
    expect(call.userId).toBe(user.id);
    expect(call.status).toBe(CallStatus.Ringing);
    expect(call.direction).toBe(CallDirection.Inbound);
    expect(call.createdAt).toBeInstanceOf(Date);
    expect(call.updatedAt).toBeInstanceOf(Date);
    expect(call.answeredAt).toBeUndefined();

    done();
  });

  test('should update a call and return an object with the update values', async (done) => {
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();
    const callSid = generateCallSid();

    let call = await calls.create(account, from, to, CallDirection.Inbound, CallStatus.Ringing, user);

    const toUpdated = generatePhoneNumber();
    const fromUpdated = generatePhoneNumber();

    call.callSid = callSid;
    call.from = fromUpdated;
    call.to = toUpdated;
    call.accountId = 'AX';
    call.userId = 'UX';
    call.status = CallStatus.Completed;
    call.direction = CallDirection.Outbound;
    call.answeredAt = new Date();

    call = await calls.save(call);

    expect(call).toBeInstanceOf(Call);
    expect(call.callSid).toBe(callSid);
    expect(call.from).toBe(fromUpdated);
    expect(call.to).toBe(toUpdated);
    expect(call.accountId).toBe('AX');
    expect(call.userId).toBe('UX');
    expect(call.status).toBe(CallStatus.Completed);
    expect(call.direction).toBe(CallDirection.Outbound);
    expect(call.callSid).toBe(callSid);
    expect(call.createdAt).toBe(call.createdAt);
    expect(call.updatedAt).toBeInstanceOf(Date);
    expect(call.answeredAt).toBeInstanceOf(Date);

    done();
  });

  test('should read an updated call and all values are set', async (done) => {
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    const callA = await calls.create(account, from, to, CallDirection.Inbound, CallStatus.Ringing, user);

    const callB = await calls.getById(callA.id);

    expect(callB).toBeInstanceOf(Call);
    expect(callB?.id).toBe(callA.id);
    expect(callB?.from).toBe(callA.from);
    expect(callB?.to).toBe(callA.to);
    expect(callB?.accountId).toBe(callA.accountId);
    expect(callB?.userId).toBe(callA.userId);
    expect(callB?.status).toBe(callA.status);
    expect(callB?.direction).toBe(callA.direction);
    expect(callB?.createdAt).toStrictEqual(callA.createdAt);
    expect(callB?.updatedAt).toStrictEqual(callA.updatedAt);

    done();
  });

  test('should update a call status and duration', async (done) => {
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    const call = await calls.create(account, from, to, CallDirection.Inbound, CallStatus.Ringing, user);

    call.status = CallStatus.InProgress;

    const callB = await calls.save(call);

    expect(callB).toBeInstanceOf(Call);
    expect(callB?.status).toBe(CallStatus.InProgress);
    expect(callB?.duration).toBeUndefined();

    call.duration = 100;
    call.status = CallStatus.Completed;

    const callC = await calls.save(call);

    expect(callC).toBeInstanceOf(Call);
    expect(callC?.status).toBe(CallStatus.Completed);
    expect(callC?.duration).toBe(100);

    done();
  });

  test('should delete a call and the following read returns undefined', async (done) => {
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    const call = await calls.create(account, from, to, CallDirection.Inbound, CallStatus.Ringing, user);
    await calls.save(call);

    expect(call).toBeInstanceOf(Call);

    await calls.remove(call);

    let callDeleted = await calls.getById(call.id);

    expect(callDeleted).toBeUndefined();

    done();
  });
});

describe('Call Repository call list', () => {
  let good: any;
  let wonka: any;

  let joe: any;
  let max: any;

  beforeAll(async (done) => {
    good = await accounts.create(corporations.good);
    wonka = await accounts.create(corporations.wonka);

    const authentication = await authenticationProvider.create(secret);

    joe = await userRepository.create(
      personas.joe,
      undefined,
      new Set(['es', 'jp']),
      good,
      authentication,
      UserRole.Owner,
      undefined,
      undefined
    );

    max = await userRepository.create(
      personas.max,
      undefined,
      new Set(['es', 'jp']),
      good,
      authentication,
      UserRole.Owner,
      undefined,
      undefined
    );

    done();
  });

  test('should read a list of calls by user and by account', async (done) => {
    const callSidA = generateCallSid();
    const callSidB = generateCallSid();
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    const call = await calls.create(good, from, to, CallDirection.Inbound, CallStatus.Ringing, joe);

    call.callSid = callSidA;

    await calls.save(call);

    const callB = await calls.create(good, from, to, CallDirection.Inbound, CallStatus.Ringing, max);

    callB.callSid = callSidB;

    await calls.save(callB);

    const callsMadeByJoe = await calls.getByUser(joe);

    expect(callsMadeByJoe).toHaveLength(1);

    const callsMadeByMax = await calls.getByUser(max);

    expect(callsMadeByMax).toHaveLength(1);
    expect(callsMadeByMax[0]).toBeInstanceOf(Call);

    const callsMadeByAccount = await calls.getByAccount(good);

    expect(callsMadeByAccount).toHaveLength(2);
    expect(callsMadeByAccount[0]).toBeInstanceOf(Call);
    expect(callsMadeByAccount[1]).toBeInstanceOf(Call);

    done();
  });

  test('should return an empty list for a user that has no calls', async (done) => {
    const callsMadeByAccount = await calls.getByUser(wonka);

    expect(callsMadeByAccount).toHaveLength(0);

    done();
  });

  test('should return a list with one call', async (done) => {
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    const call = await calls.create(wonka, from, to, CallDirection.Inbound, CallStatus.Ringing, max);

    const callsMadeByAccount = await calls.getByAccount(wonka);

    expect(callsMadeByAccount).toHaveLength(1);

    done();
  });
});
