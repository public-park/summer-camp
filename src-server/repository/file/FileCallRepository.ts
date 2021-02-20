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
import { CallDocument } from '../../models/documents/CallDocument';

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

    this.calls = this.fromFile(this.load());

    this.eventEmitter = new EventEmitter();
  }

  async create(
    accountId: string,
    from: string,
    to: string,
    direction: CallDirection,
    status: CallStatus,
    user?: User,
    callSid?: string
  ) {
    const call = new Call(uuidv4(), from, to, accountId, direction, status, user, callSid);

    return this.save(call);
  }

  async save(call: Call) {
    call.updatedAt = new Date();

    this.calls.set(call.id, call);

    await this.persist(this.toFile());

    this.eventEmitter.emit('call', call);

    return call;
  }

  protected fromFile(list: Array<unknown>): Map<string, Call> {
    const calls = new Map<string, Call>();

    list.map((data) => {
      const call = this.convertDocumentToCall(data);

      calls.set(call.id, call);
    });

    return calls;
  }

  protected convertDocumentToCall(data: unknown): Call {
    if (!isValidCallDocument(data)) {
      throw new InvalidDocumentException();
    }

    const item = data as CallDocument;

    const call = new Call(item.id, item.from, item.to, item.accountId, item.direction, item.status);

    call.createdAt = new Date(item.createdAt);

    call.userId = item.userId;
    call.callSid = item.callSid;
    call.duration = item.duration;
    call.answeredAt = item.answeredAt ? new Date(item.answeredAt) : undefined;
    call.updatedAt = item.updatedAt ? new Date(item.updatedAt) : undefined;

    return call;
  }

  async getById(id: string) {
    const call = this.calls.get(id);

    if (call) {
      return Promise.resolve(call);
    }
  }

  protected toFile(): Array<CallDocument> {
    return Array.from(this.calls.values()).map((call) => {
      return call.toDocument();
    });
  }

  async getByCallSid(callSid: string) {
    for (const call of this.calls.values()) {
      if (call.callSid === callSid) {
        return Promise.resolve(call);
      }
    }
  }

  async getByUser(user: User, skip: number = 0, limit: number = 50) {
    const list = Array.from(this.calls.values()).filter((call) => call.userId == user.id);

    return Promise.resolve(
      list
        .map((call) => call)
        .filter((call, index) => index >= skip && index < limit)
        .reverse()
    );
  }

  async getByAccount(account: Account, skip: number = 0, limit: number = 50) {
    const list = Array.from(this.calls.values()).filter((call) => call.accountId == account.id);

    return Promise.resolve(
      list
        .map((call) => call)
        .filter((call, index) => index >= skip && index < limit)
        .reverse()
    );
  }

  async remove(call: Call) {
    if (!(await this.getById(call.id))) {
      throw new CallNotFoundException();
    }

    this.calls.delete(call.id);

    return this.persist(this.toFile());
  }

  onLifecycleEvent(listener: (call: Call) => void) {
    this.eventEmitter.on('call', listener);
  }
}
