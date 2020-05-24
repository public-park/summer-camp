import * as Pino from 'pino';

export const log = Pino({
  name: 'summer-camp',
  level: 'debug',
});

process.on('uncaughtException', log.fatal.bind(log));
