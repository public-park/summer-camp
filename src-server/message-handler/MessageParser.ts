import * as WebSocket from 'ws';
import * as Ajv from 'ajv';
import { MessageSchema, Message } from '../models/socket/messages/Message';
import { InvalidMessageException } from '../exceptions/InvalidMessageException';

const ajv = new Ajv();

const validateSchema = ajv.compile(MessageSchema);

const parse = (data: WebSocket.Data) => {
  try {
    return JSON.parse(data.toString());
  } catch (error) {
    throw new InvalidMessageException(error.name);
  }
};

const validate = (data: unknown): Message => {
  const isValid = validateSchema(data);

  if (!isValid) {
    throw new InvalidMessageException(`Schema validation failed`);
  }

  return data as Message;
};

export const MessageParser = { parse, validate };
