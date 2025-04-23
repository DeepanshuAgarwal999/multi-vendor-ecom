import { Injectable } from '@nestjs/common';
import { DatabaseException } from 'packages/error-handler/exceptions';

@Injectable()
export class AppService {
  getData(): { message: string } {
    return { message: 'Hello from auth service' };
  }
}
