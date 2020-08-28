import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../BaseRepository';
import { CallRepository } from '../CallRepository';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { FileBaseRepository } from './FileBaseRepository';
import { Call } from '../../models/Call';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';

export class FileCallRepository extends FileBaseRepository<Call> implements CallRepository, BaseRepository<Call> {
  calls: Map<string, Call>;

  constructor(fileName: string) {
    super(fileName);

    this.calls = this.fromPlainObjects(this.load());
  }

  async create(
    from: string,
    to: string,
    account: Account,
    status: CallStatus,
    direction: CallDirection,
    user?: User,
    callSid?: string
  ) {
    const call = new Call(uuidv4(), callSid, from, to, account.id, user?.id, status, direction);

    call.createdAt = new Date();

    this.calls.set(call.id, call);

    await this.persist(this.toPlainObjects());

    return Promise.resolve(call);
  }

  protected fromPlainObjects(list: Array<any>): Map<string, Call> {
    const calls = new Map<string, Call>();

    list.map((item) => {
      calls.set(item.id, this.fromPlainObject(item));
    });

    return calls;
  }

  protected fromPlainObject(item: any): Call {
    return new Call(
      item.id,
      item.callSid,
      item.from,
      item.to,
      item.accountId,
      item.userId,
      item.status,
      item.direction,
      item.createdAt,
      item.duration,
      item.updateAt
    );
  }

  async getById(id: string) {
    const call = this.calls.get(id);

    if (call) {
      return Promise.resolve(this.getCopy(call));
    }
  }

  protected getCopy(call: Call) {
    return this.fromPlainObject(this.toPlainObject(call));
  }

  protected toPlainObjects(): Array<any> {
    return Array.from(this.calls.values()).map((call) => {
      return this.toPlainObject(call);
    });
  }

  protected toPlainObject(call: Call): any {
    return {
      ...call,
    };
  }

  async getByCallSid(callSid: string) {
    for (const call of this.calls.values()) {
      if (call.callSid === callSid) {
        return Promise.resolve(this.getCopy(call));
      }
    }
  }

  async getByUser(user: User, skip: number = 0, limit: number = 50) {
    const list = Array.from(this.calls.values()).filter(
      (call, index) => call.userId == user.id && index >= skip && index < limit
    );
    return Promise.resolve(list.map((call) => this.getCopy(call)).reverse());
  }

  async getByAccount(account: Account, skip: number = 0, limit: number = 50) {
    const list = Array.from(this.calls.values()).filter(
      (call, index) => call.accountId == account.id && index >= skip && index < limit
    );
    return Promise.resolve(list.map((call) => this.getCopy(call)).reverse());
  }

  async update(call: Call) {
    call.updatedAt = new Date();

    this.calls.set(call.id, call);

    await this.persist(this.toPlainObjects());

    return Promise.resolve(<Call>this.getCopy(call));
  }

  async delete(call: Call) {
    if (!(await this.getById(call.id))) {
      throw new CallNotFoundException();
    }

    this.calls.delete(call.id);

    return this.persist(this.toPlainObjects());
  }
}
