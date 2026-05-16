import { Injectable } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';

@Injectable()
export default class Logger {
  private logger = createLogger({
    format: format.combine(
      format.timestamp(),
      format.printf(
        ({ timestamp, level, message }) =>
          `[${timestamp as string}][${level}]${message as string}`,
      ),
    ),
    transports: [
      new transports.Console(),
      new transports.File({ filename: 'logs/assistant-backend.log' }),
    ],
  });

  info(message: string) {
    this.logger.info(message);
  }

  error(message: string) {
    this.logger.error(message);
  }
}
