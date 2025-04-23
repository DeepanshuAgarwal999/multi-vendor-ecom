import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { UserService } from './user.service';

@Resolver('User')
export class UserResolver {
  constructor(private userService: UserService) {}

  @Query('users')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Query('user')
  async getUser(@Args('id') id: string) {
    return this.userService.getUser(id);
  }

  @Mutation('userRegistration')
  async userRegistration(
    @Args('name') name: string,
    @Args('email') email: string,
    @Args('password') password: string
  ) {
    return this.userService.userRegistration({ name, email, password });
  }

  @Mutation('updateUser')
  async updateUser(
    @Args('id') id: string,
    @Args('name') name: string,
    @Args('email') email: string
  ) {
    return this.userService.updateUser(id, name, email);
  }

  @Mutation('deleteUser')
  async deleteUser(@Args('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
