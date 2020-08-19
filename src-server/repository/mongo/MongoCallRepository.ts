import { BaseRepository } from '../BaseRepository';
import { CallRepository, CallData } from '../CallRepository';
import { Call } from '../../models/Call';
import { CallStatus } from '../../models/CallStatus';
import CallModel from './CallSchema';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';

export class MongoCallRepository implements CallRepository, BaseRepository<Call> {
  async create(data: CallData, account: Account, user?: User) {
    const model = new CallModel({
      ...data,
      accountId: account.id,
      userId: user?.id,
    });

    const document = await model.save();

    return document.toCall();
  }

  async updateStatus(id: string, status: CallStatus, callSid?: string, duration?: number) {
    const updatedAt = new Date();

    const payload: any = { status, updatedAt };

    if (callSid) {
      payload.callSid = callSid;
    }

    if (duration) {
      payload.duration = duration;
    }

    const document = await CallModel.findOneAndUpdate(
      {
        _id: id,
      },
      payload,
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
      },
      {
        new: true,
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
