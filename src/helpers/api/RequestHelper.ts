import superagent from 'superagent';
import { User } from '../../models/User';

export class RequestFactory {
  url: string;
  parameters: {} | undefined;
  body: {} | undefined;
  headers: {};
  deadline: number;

  constructor(url: string) {
    this.url = url;
    this.headers = {};
    this.deadline = 8000;
  }

  withBody(body: {}) {
    Object.assign(this.headers, { 'Content-Type': 'application/json' });

    this.body = body;

    return this;
  }

  withHeaders(headers: {}) {
    Object.assign(this.headers, headers);

    return this;
  }

  withAuthentication(user: User) {
    return this.withHeaders({ Token: user.token });
  }

  async post(body: {} | undefined = undefined) {
    return await superagent
      .post(this.url)
      .accept('application/json')
      .set(this.headers)
      .send(body)
      .timeout({ deadline: this.deadline });
  }

  async fetch() {
    return await superagent.get(this.url).set(this.headers).send(this.body).timeout({ deadline: this.deadline });
  }
}

export const request = (url: string): RequestFactory => {
  return new RequestFactory(url);
};

export const create = (url: string): RequestFactory => {
  return new RequestFactory(url);
};

export const isRequest = <T>(payload: Response | T | undefined): payload is T => {
  return payload instanceof Response;
};
