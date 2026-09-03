import type { ValidationPipeOptions } from '@nestjs/common';

export function getValidationPipe(): ValidationPipeOptions {
  return {
    whitelist: true,
    transform: true,
  };
}
