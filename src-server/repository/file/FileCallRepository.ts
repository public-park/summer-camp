import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../BaseRepository';
import { CallRepository } from '../CallRepository';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { FileBaseRepository } from './FileBaseRepository';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';
import { EventEmitter } from 'events';
import { InvalidDocumentException } from '../../exceptions/InvalidDocumentException';
import { Call } from '../../models/Call';

interface CallDocument {
  id: string;
  from: string;
  to: string;
  accountId: string;
  status: CallStatus;
  direction: CallDirection;
  userId: string | undefined;
  callSid: string | undefined;
  duration: number | undefined;
  createdAt: string;
  updatedAt: string | undefined;
  answeredAt: string | undefined;
}

const isValidCallDocument = (data: unknown) => {
  if (typeof data !== 'object') {
    return false;
  }

  if (
    !data ||
    !data.hasOwnProperty('id') ||
    !data.hasOwnProperty('from') ||
    !data.hasOwnProperty('to') ||
    !data.hasOwnProperty('accountId') ||
    !data.hasOwnProperty('status') ||
    !data.hasOwnProperty('direction')
  ) {
    return false;
  }

  return true;
};

export class FileCallRepository extends FileBaseRepository<Call> implements CallRepository, BaseRepository<Call> {
  calls: Map<string, Call>;
  private eventEmitter: EventEmitter;

  constructor(fileName: string) {
    super(fileName);

    this.calls = this.fromPlainObjects(this.load());

    this.eventEmitter = new EventEmitter();
  }

  async create(
    account: Account,
    from: string,
    to: string,
    direction: CallDirection,
    status: CallStatus,
    user?: User,
    callSid?: string
  ) {
    const call = new Call(uuidv4(), from, to, account.id, direction, status, user, callSid);

    return this.save(call);
  }

  async save(call: Call) {
    call.updatedAt = new Date();

    this.calls.set(call.id, call);

    await this.persist(this.toPlainObjects());

    this.eventEmitter.emit('call', call);

    return call;
  }

  protected fromPlainObjects(list: Array<unknown>): Map<string, Call> {
    const calls = new Map<string, Call>();

    list.map((data) => {
      const call = this.fromPlainObject(data);

      calls.set(call.id, call);
    });

    return calls;
  }

  protected fromPlainObject(data: unknown): Call {
    if (!isValidCallDocument(data)) {
      throw new InvalidDocumentException();
    }

    const item = data as CallDocument;

    const call = new Call(item.id, item.from, item.to, item.accountId, item.direction, item.status);

    call.createdAt = new Date(item.createdAt);

    if (item.userId) {
      call.userId = item.userId;
    }

    if (item.callSid) {
      call.callSid = item.callSid;
    }

    if (item.status) {
      call.status = item.status;
    }
    if (item.duration) {
      call.duration = item.duration;
    }

    if (item.answeredAt) {
      call.answeredAt = new Date(item.answeredAt);
    }

    if (item.updatedAt) {
      call.updatedAt = new Date(item.updatedAt);
    }

    return call;
  }

  async getById(id: string) {
    const call = this.calls.get(id);

    if (call) {
      return Promise.resolve(call);
    }
  }

  protected toPlainObjects(): Array<CallDocument> {
    return Array.from(this.calls.values()).map((call) => {
      return this.toPlainObject(call);
    });
  }

  protected toPlainObject(call: Call): CallDocument {
    return {
      ...call,
      createdAt: call.createdAt.toString(),
      updatedAt: call.updatedAt ? call.updatedAt.toString() : undefined,
      answeredAt: call.answeredAt ? call.answeredAt.toString() : undefined,
    };
  }

  async getByCallSid(callSid: string) {
    for (const call of this.calls.values()) {
      if (call.callSid === callSid) {
        return Promise.resolve(call);
      }
    }
  }

  async getByUser(user: User, skip: number = 0, limit: number = 50) {
    const list = Array.from(this.calls.values()).filter(
      (call, index) => call.userId == user.id && index >= skip && index < limit
    );
    return Promise.resolve(list.map((call) => call).reverse());
  }

  async getByAccount(account: Account, skip: number = 0, limit: number = 50) {
    const list = Array.from(this.calls.values()).filter(
      (call, index) => call.accountId == account.id && index >= skip && index < limit
    );
    return Promise.resolve(list.map((call) => call).reverse());
  }

  async remove(call: Call) {
    if (!(await this.getById(call.id))) {
      throw new CallNotFoundException();
    }

    this.calls.delete(call.id);

    return this.persist(this.toPlainObjects());
  }

  onLifecycleEvent(listener: (call: Call) => void) {
    this.eventEmitter.on('call', listener);
  }
}
