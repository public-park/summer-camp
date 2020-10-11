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
  Tags = 'tags',
  User = 'user',
  Hold = 'hold',
  Accept = 'accept',
  Configuration = 'configuration',
  Activity = 'activity',
  InitiateCall = 'initiate-connect',
  Call = 'call',
  Record = 'record',
  Error = 'error',
}
