import { WsException } from '@nestjs/websockets';
import { WsErrorCodes } from './error-codes.enum';
import { HttpStatus } from '@nestjs/common';

export class AppWsException extends WsException {
  constructor(errorCode: WsErrorCodes, message: string, status: HttpStatus) {
    super({
      code: errorCode,
      message,
      status: status,
    });
  }
}
