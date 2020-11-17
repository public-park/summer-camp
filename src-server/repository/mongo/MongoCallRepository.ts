import { BaseRepository } from '../BaseRepository';
import { CallRepository } from '../CallRepository';
import { Call } from '../../models/Call';
import CallModel from './CallSchema';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export class MongoCallRepository implements CallRepository, BaseRepository<Call> {
  private eventEmitter: EventEmitter;

  constructor() {
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

  async getById(id: string) {
    const document = await CallModel.findById(id);

    if (document) {
      return document.toCall();
    }
  }

  async getByCallSid(callSid: string) {
    const document = await CallModel.findOne({ callSid: callSid });

    if (document) {
      return document.toCall();
    }
  }

  async getByUser(user: User, skip: number = 0, limit: number = 50) {
    const documents = await CallModel.find({ userId: user.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'descending' });

    return documents.map((document) => document.toCall());
  }

  async getByAccount(account: Account, skip: number = 0, limit: number = 50) {
    const documents = await CallModel.find({ accountId: account.id })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: 'descending' });

    return documents.map((document) => document.toCall());
  }

  async save(call: Call) {
    const document = await CallModel.findOneAndUpdate(
      { _id: call.id },
      {
        ...call,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (document) {
      const it = document.toCall();

      this.eventEmitter.emit('call', call);

      return it;
    } else {
      throw new CallNotFoundException();
    }
  }

  async remove(call: Call) {
    const document = await CallModel.deleteOne({ _id: call.id });

    if (document) {
      return;
    } else {
      throw new CallNotFoundException();
    }
  }

  onLifecycleEvent(listener: (call: Call) => void) {
    this.eventEmitter.on('call', listener);
  }
}
