import * as WebSocket from 'ws';
import * as url from 'url';
import { TokenHelper } from '../helpers/TokenHelper';
import { InvalidUrlException } from '../exceptions/InvalidUrlException';
import { log } from '../logger';

export const verifyJwtOnUpgrade: WebSocket.VerifyClientCallbackSync = (info) => {
  log.info(`client connected: ${info.req.connection.remoteAddress}`);

  try {
    if (!info.req.url) {
      throw new InvalidUrlException();
    }

    const query = url.parse(info.req.url, true).query;

    const payload = TokenHelper.verifyJwt(<string>query.t);

    log.info(`client ${payload.id} authenticated`);

    info.req.headers.id = payload.id;
    info.req.headers.token = query.t;

    return true;
  } catch (error) {
    log.debug(error);
    return false;
  }
};
