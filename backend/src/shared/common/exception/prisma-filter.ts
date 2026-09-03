import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpStatus,
} from '@nestjs/common';
import { Prisma } from '@prisma/generated/client';
import { Response } from 'express';

@Catch(Prisma.PrismaClientKnownRequestError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(exception: Prisma.PrismaClientKnownRequestError, host: ArgumentsHost) {
    if (exception.code === 'P2002') {
      const res = host.switchToHttp().getResponse<Response>();

      let status = HttpStatus.INTERNAL_SERVER_ERROR;
      let message = 'Internal server error';

      switch (exception.code as string) {
        case 'P2002':
          status = HttpStatus.CONFLICT; // 409
          message = 'Resource already exists';
          break;

        case 'P2025':
          status = HttpStatus.NOT_FOUND; // 404
          message = 'Record not found';
          break;

        case 'P2003':
          status = HttpStatus.BAD_REQUEST; // 400
          message = 'Foreign key constraint failed';
          break;

        default:
          throw exception;
      }

      res.status(status).json({
        statusCode: status,
        message,
      });
    }
  }
}
