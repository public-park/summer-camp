require('dotenv').config();

import {
  init,
  personas,
  accountRepository,
  callRepository,
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
    account = await accountRepository.create(`${personas.alice}'s Account`);
    authentication = await authenticationProvider.create(secret);

    user = await userRepository.create(
      personas.alice,
      undefined,
      new Set(['es', 'jp']),
      account,
      authentication,
      UserRole.Owner
    );

    done();
  });

  test('should create a call and set all values', async (done) => {
    const callSid = generateCallSid();
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    const call = await callRepository.create(
      from,
      to,
      account,
      CallStatus.Ringing,
      CallDirection.Inbound,

      user,
      callSid
    );

    expect(call).toBeInstanceOf(Call);
    expect(call.callSid).toBe(callSid);
    expect(call.from).toBe(from);
    expect(call.to).toBe(to);
    expect(call.accountId).toBe(account.id);
    expect(call.userId).toBe(user.id);
    expect(call.status).toBe(CallStatus.Ringing);
    expect(call.direction).toBe(CallDirection.Inbound);
    expect(call.createdAt).toBeInstanceOf(Date);
    expect(call.updatedAt).toBeUndefined();
    expect(call.answeredAt).toBeUndefined();

    done();
  });

  test('should update a call and return an object with the update values', async (done) => {
    const callSid = generateCallSid();
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    let call = await callRepository.create(from, to, account, CallStatus.Ringing, CallDirection.Inbound, user, callSid);

    const callSidUpdate = generateCallSid();
    const toUpdated = generatePhoneNumber();
    const fromUpdated = generatePhoneNumber();

    call.callSid = callSidUpdate;
    call.from = fromUpdated;
    call.to = toUpdated;
    call.accountId = 'AX';
    call.userId = 'UX';
    call.status = CallStatus.Completed;
    call.direction = CallDirection.Outbound;
    call.answeredAt = new Date();

    call = await callRepository.update(call);

    expect(call).toBeInstanceOf(Call);
    expect(call.callSid).toBe(callSidUpdate);
    expect(call.from).toBe(fromUpdated);
    expect(call.to).toBe(toUpdated);
    expect(call.accountId).toBe('AX');
    expect(call.userId).toBe('UX');
    expect(call.status).toBe(CallStatus.Completed);
    expect(call.direction).toBe(CallDirection.Outbound);
    expect(call.createdAt).toBe(call.createdAt);
    expect(call.updatedAt).toBeInstanceOf(Date);
    expect(call.answeredAt).toBeInstanceOf(Date);

    done();
  });

  test('should read an updated call and all values are set', async (done) => {
    const callSid = generateCallSid();
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    const callA = await callRepository.create(
      from,
      to,
      account,
      CallStatus.Ringing,
      CallDirection.Inbound,

      user,
      callSid
    );

    const callB = await callRepository.getById(callA.id);

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
    const callSid = generateCallSid();
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    const call = await callRepository.create(
      from,
      to,
      account,
      CallStatus.Ringing,
      CallDirection.Inbound,

      user,
      callSid
    );

    call.status = CallStatus.InProgress;

    const callB = await callRepository.update(call);

    expect(callB).toBeInstanceOf(Call);
    expect(callB?.status).toBe(CallStatus.InProgress);
    expect(callB?.duration).toBeUndefined();

    call.duration = 100;
    call.status = CallStatus.Completed;

    const callC = await callRepository.update(call);

    expect(callC).toBeInstanceOf(Call);
    expect(callC?.status).toBe(CallStatus.Completed);
    expect(callC?.duration).toBe(100);

    done();
  });

  test('should delete a call and the following read returns undefined', async (done) => {
    const callSid = generateCallSid();
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    const call = await callRepository.create(
      from,
      to,
      account,
      CallStatus.Ringing,
      CallDirection.Inbound,
      user,
      callSid
    );

    expect(call).toBeInstanceOf(Call);

    await callRepository.delete(call);

    let callDeleted = await callRepository.getById(call.id);

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
    good = await accountRepository.create(corporations.good);
    wonka = await accountRepository.create(corporations.wonka);

    const authentication = await authenticationProvider.create(secret);

    joe = await userRepository.create(
      personas.joe,
      undefined,
      new Set(['es', 'jp']),
      good,
      authentication,
      UserRole.Owner
    );

    max = await userRepository.create(
      personas.max,
      undefined,
      new Set(['es', 'jp']),
      good,
      authentication,
      UserRole.Owner
    );

    done();
  });

  test('should read a list of calls by user and by account', async (done) => {
    const callSidA = generateCallSid();
    const callSidB = generateCallSid();
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    await callRepository.create(from, to, good, CallStatus.Ringing, CallDirection.Inbound, joe, callSidA);
    await callRepository.create(from, to, good, CallStatus.Ringing, CallDirection.Inbound, max, callSidB);

    const callsMadeByJoe = await callRepository.getByUser(joe);

    expect(callsMadeByJoe).toHaveLength(1);

    const callsMadeByMax = await callRepository.getByUser(max);

    expect(callsMadeByMax).toHaveLength(1);
    expect(callsMadeByMax[0]).toBeInstanceOf(Call);

    const callsMadeByAccount = await callRepository.getByAccount(good);

    expect(callsMadeByAccount).toHaveLength(2);
    expect(callsMadeByAccount[0]).toBeInstanceOf(Call);
    expect(callsMadeByAccount[1]).toBeInstanceOf(Call);

    done();
  });

  test('should return an empty list for a user that has no calls', async (done) => {
    const callsMadeByAccount = await callRepository.getByUser(wonka);

    expect(callsMadeByAccount).toHaveLength(0);

    done();
  });

  test('should return a list with one call', async (done) => {
    const callSid = generateCallSid();
    const to = generatePhoneNumber();
    const from = generatePhoneNumber();

    await callRepository.create(from, to, wonka, CallStatus.Ringing, CallDirection.Inbound, max, callSid);

    const callsMadeByAccount = await callRepository.getByAccount(wonka);

    expect(callsMadeByAccount).toHaveLength(1);

    done();
  });
});
