import { v4 as uuidv4 } from 'uuid';
import { BaseRepository } from '../BaseRepository';
import { CallRepository } from '../CallRepository';
import { User } from '../../models/User';
import { Account } from '../../models/Account';
import { CallNotFoundException } from '../../exceptions/CallNotFoundException';
import { CallStatus } from '../../models/CallStatus';
import { CallDirection } from '../../models/CallDirection';
import { EventEmitter } from 'events';
import { InvalidDocumentException } from '../../exceptions/InvalidDocumentException';
import { Call } from '../../models/Call';
import { Firestore, Timestamp } from '@google-cloud/firestore';

interface CallFirestoreDocument {
  id: string;
  from: string;
  to: string;
  accountId: string;
  status: CallStatus;
  direction: CallDirection;
  userId?: string;
  callSid?: string;
  duration?: number;
  createdAt: Timestamp;
  updatedAt?: Timestamp;
  answeredAt?: Timestamp;
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

export class FirestoreCallRepository implements CallRepository, BaseRepository<Call> {
  private eventEmitter: EventEmitter;
  private firestore: Firestore;
  private COLLECTION_NAME: string;

  constructor(firestore: Firestore, COLLECTION_NAME: string) {
    this.eventEmitter = new EventEmitter();
    this.firestore = firestore;
    this.COLLECTION_NAME = COLLECTION_NAME;
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

    await this.firestore.doc(`${this.COLLECTION_NAME}/${call.id}`).set(this.convertCallToDocument(call));

    this.eventEmitter.emit('call', call);

    return call;
  }

  protected convertDocumentToCall(data: unknown): Call {
    if (!isValidCallDocument(data)) {
      throw new InvalidDocumentException();
    }

    const item = data as CallFirestoreDocument;

    const call = new Call(item.id, item.from, item.to, item.accountId, item.direction, item.status);

    call.createdAt = item.createdAt.toDate();

    call.callSid = item.callSid ?? undefined;
    call.duration = item.duration ?? undefined;

    call.answeredAt = item.answeredAt ? item.answeredAt.toDate() : undefined;
    call.updatedAt = item.updatedAt ? item.updatedAt.toDate() : undefined;

    return call;
  }

  async getById(id: string) {
    const document = await this.firestore.doc(`${this.COLLECTION_NAME}/${id}`).get();

    if (document.exists) {
      return this.convertDocumentToCall(document.data());
    }
  }
  protected convertCallToDocument(call: Call): CallFirestoreDocument {
    return {
      ...call,
      createdAt: Timestamp.fromDate(call.createdAt),
      updatedAt: call.updatedAt ? Timestamp.fromDate(call.updatedAt) : undefined,
      answeredAt: call.answeredAt ? Timestamp.fromDate(call.answeredAt) : undefined,
    };
  }

  async getByCallSid(callSid: string) {
    const list = await this.firestore.collection(this.COLLECTION_NAME).where('callSid', '==', callSid).limit(1).get();

    if (!list.empty && list.docs[0]) {
      return this.convertDocumentToCall(list.docs[0].data());
    }
  }

  async getByUser(user: User, skip: number = 0, limit: number = 50) {
    const list = await this.firestore
      .collection(this.COLLECTION_NAME)
      .where('userId', '==', user.id)
      .orderBy('createdAt', 'desc')
      .offset(skip)
      .limit(limit)
      .get();

    const calls: Array<Call> = [];

    list.forEach((document) => {
      calls.push(this.convertDocumentToCall(document.data()));
    });

    return calls;
  }

  async getByAccount(account: Account, skip: number = 0, limit: number = 50) {
    const list = await this.firestore
      .collection(this.COLLECTION_NAME)
      .where('accountId', '==', account.id)
      .orderBy('createdAt', 'desc')
      .offset(skip)
      .limit(limit)
      .get();

    const calls: Array<Call> = [];

    list.forEach((document) => {
      calls.push(this.convertDocumentToCall(document.data()));
    });

    return calls;
  }

  async remove(call: Call) {
    if (!(await this.getById(call.id))) {
      throw new CallNotFoundException();
    }

    await this.firestore.collection(this.COLLECTION_NAME).doc(call.id).delete();
  }

  onLifecycleEvent(listener: (call: Call) => void) {
    this.eventEmitter.on('call', listener);
  }
}
