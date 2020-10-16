import { EventEmitter } from 'ws';
import { Message } from '../models/socket/messages/Message';

export class AcknowledgeMessageHandler {
  private emitter: EventEmitter;

  constructor() {
    this.emitter = new EventEmitter();
  }

  on(name: string, listener: (message: Message) => Promise<void> | void) {
    this.emitter.on(name, listener);
  }

  handle(message: Message) {
    this.emitter.emit(message.header.id, message);
  }
}
