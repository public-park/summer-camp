import { Response } from 'superagent';

export class RequestException extends Error {
  response: Response;
  constructor(response: Response, message: string) {
    super(message);

    this.response = response;
  }
}
