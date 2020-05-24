import * as jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { log } from '../logger';

export interface TokenPayload {
  id: string;
  iat: number;
  exp: number;
}

const createJwt = (user: User, ttl: number): string => {
  const payload: TokenPayload = {
    iat: Date.now(),
    exp: Math.floor(Date.now() / 1000) + ttl,
    id: user.id,
  };

  return jwt.sign(payload, <string>process.env.SESSION_SECRET);
};

const verifyJwt = (token: string): TokenPayload => {
  const payload = <TokenPayload>jwt.verify(token, <string>process.env.SESSION_SECRET);

  log.debug(`createJwt result ${JSON.stringify(payload)}`);

  return payload;
};

export const TokenHelper = {
  createJwt,
  verifyJwt,
};
