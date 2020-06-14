import { BaseRepository } from '../BaseRepository';
import { CallRepository, CallData } from '../CallRepository';
import { Call } from '../../models/Call';
import { CallStatus } from '../../models/CallStatus';
import CallModel from './CallSchema';
import { CallNotFoundError } from '../CallNotFoundError';
import { User } from '../../models/User';
import { Account } from '../../models/Account';

export class MongoCallRepository implements CallRepository, BaseRepository<Call> {
  async create(data: CallData) {
    const model = new CallModel({
      callSid: data.callSid,
      from: data.from,
      to: data.to,
      accountId: data.accountId,
      userId: data.userId,
      status: data.status,
      direction: data.direction,
      duration: data.duration,
    });

    const document = await model.save();

    return document.toCall();
  }

  async updateStatus(callSid: string, status: CallStatus, duration?: number) {
    const updatedAt = new Date();

    const document = await CallModel.findOneAndUpdate(
      {
        callSid: callSid,
      },
      { status, duration, updatedAt },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    ).orFail();

    return document.toCall();
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

  async getCallsByUser(user: User) {
    const documents = await CallModel.find({ userId: user.id }).limit(30).sort({ createdAt: 'descending' }); // TODO, implement start, offset

    return documents.map((document) => document.toCall());
  }

  async getCallsByAccount(account: Account) {
    const documents = await CallModel.find({ accountId: account.id }).limit(30).sort({ createdAt: 'descending' });

    return documents.map((document) => document.toCall());
  }

  async getAll() {
    const documents = await CallModel.find({}).sort({ createdAt: 'descending' });

    return documents.map((document) => document.toCall());
  }

  async update(entity: Call) {
    const document = await CallModel.findOneAndUpdate(
      { _id: entity.id },
      {
        ...entity,
      },
      {
        new: true,
      }
    );

    if (document) {
      return document.toCall();
    } else {
      throw new CallNotFoundError();
    }
  }

  async delete(entity: Call) {
    const document = await CallModel.deleteOne({ _id: entity.id });

    if (document) {
      return;
    } else {
      throw new CallNotFoundError();
    }
  }
}
