import { v4 as uuidv4 } from 'uuid';

export class Message {
  header: {
    id: string;
    type: MessageType;
  };
  payload: any;

  constructor(type: MessageType, messageId: string = uuidv4()) {
    this.header = {
      id: messageId,
      type: type,
    };
    this.payload = null;
  }

  toString() {
    return JSON.stringify(this);
  }
}

export enum MessageType {
  Acknowledge = 'acknowledge',
  Tags = 'tags',
  User = 'user',
  Configuration = 'configuration',
  Connect = 'connect',
  Activity = 'activity',
  InitiateCall = 'initiate-connect',
  Call = 'call',
  Accept = 'accept',
  Reject = 'reject',
  Record = 'record',
  Hold = 'hold',
  Transfer = 'transfer',
  Error = 'error',
}

export const MessageSchema = {
  type: 'object',
  properties: {
    header: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        type: { type: 'string' },
      },
      additionalProperties: false,
    },
    payload: {
      type: 'object',
    },
  },
  required: ['header'],
  additionalProperties: false,
};
