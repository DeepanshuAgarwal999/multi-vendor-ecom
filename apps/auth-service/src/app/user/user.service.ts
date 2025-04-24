import { ConflictException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prismaService: PrismaService) {}

  async userRegistration({ name, email, password }) {
    const userExist = await this.prismaService.users.findFirst({
      where: { email },
    });
    if (userExist) {
      throw new ConflictException('User already exist');
    }
    const user = await this.prismaService.users.create({
      data: { name, email, password, imagesId: '', following: [] },
    });
    return user;
  }
  async getAllUsers() {
    return this.prismaService.users.findMany();
  }
  async getUser(id: string) {
    return this.prismaService.users.findUnique({
      where: { id },
    });
  }
}
