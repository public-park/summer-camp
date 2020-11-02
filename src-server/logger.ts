import * as Pino from 'pino';

export const log = Pino({
  name: 'summer-camp',
  level: process.env.LOG_LEVEL || 'info',
});

process.on('uncaughtException', log.fatal.bind(log));
