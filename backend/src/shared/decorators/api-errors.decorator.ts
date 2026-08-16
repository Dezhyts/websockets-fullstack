import { applyDecorators, Type } from '@nestjs/common';
import {
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';

export function ApiStandardErrors(errorType?: Type<unknown>) {
  return applyDecorators(
    ApiUnauthorizedResponse({
      description: 'Unauthorized',
      type: errorType,
    }),
    ApiForbiddenResponse({
      description: 'Forbidden',
      type: errorType,
    }),
    ApiNotFoundResponse({
      description: 'Not found',
      type: errorType,
    }),
  );
}
