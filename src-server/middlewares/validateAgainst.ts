import * as Ajv from 'ajv';
import { Request, Response } from 'express';
import { InvalidRequestBodyException } from '../exceptions/InvalidRequestBodyException';
import { log } from '../logger';

export const validateAgainst = (schema: {}) => {
  const ajv = new Ajv();

  const validate = ajv.compile(schema);

  return (request: Request, response: Response, next: Function) => {
    const isValid = validate(request.body);

    if (isValid) {
      return next();
    } else {
      log.debug(`json validation failed ${validate.errors?.toString()}`);
      return next(new InvalidRequestBodyException());
    }
  };
};
