import { BaseRepository } from '../BaseRepository';
import { CallRepository } from '../CallRepository';
import { Call } from '../../models/Call';
import CallModel from './CallSchema';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';

export class MongoCallRepository implements CallRepository, BaseRepository<Call> {
  async create(
    from: string,
    to: string,
    account: Account,
    status: CallStatus,
    direction: CallDirection,
    user?: User,
    callSid?: string
  ) {
    const model = new CallModel({
      from: from,
      to: to,
      accountId: account.id,
      status: status,
      direction: direction,
      userId: user?.id,
      callSid: callSid,
    });

    const document = await model.save();

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

  async update(entity: Call) {
    const document = await CallModel.findOneAndUpdate(
      { _id: entity.id },
      {
        ...entity,
        updatedAt: new Date(),
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    if (document) {
      return document.toCall();
    } else {
      throw new CallNotFoundException();
    }
  }

  async delete(call: Call) {
    const document = await CallModel.deleteOne({ _id: call.id });

    if (document) {
      return;
    } else {
      throw new CallNotFoundException();
    }
  }
}
