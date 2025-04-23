import { HttpException } from '@nestjs/common';

export class DatabaseException extends HttpException {
  constructor() {
    super('Database error', 500);
  }
}
