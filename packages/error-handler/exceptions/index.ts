import { HttpException } from '@nestjs/common';

export class DatabaseException extends HttpException {
  constructor(message?: string) {
    super(message || 'Database error', 500);
  }
}

export class TooManyRequestsException extends HttpException {
  constructor(message?: string) {
    super(message || 'Too many requests', 429);
  }
}
