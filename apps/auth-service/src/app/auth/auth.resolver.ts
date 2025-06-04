import { Args, Mutation, Resolver, Query } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { validateRegistrationData } from '../../utils/auth.helper';

@Resolver('User')
export class AuthResolver {
  constructor(private userService: AuthService) {}

  @Query('users')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @Query('user')
  async getUser(@Args('id') id: string) {
    return this.userService.getUser(id);
  }

  @Mutation('userRegistration')
  async userRegistration(@Args('name') name: string, @Args('email') email: string, @Args('password') password: string) {
    validateRegistrationData({ name, email, password }, 'user');
    return this.userService.userRegistration({ name, email });
  }

  @Mutation('verifyRegistrationOtp')
  async verifyRegistrationOtp(@Args('email') email: string, @Args('otp') otp: string) {
    return this.userService.verifyRegistrationOtp(email, otp);
  }

  @Mutation('updateUser')
  async updateUser(@Args('id') id: string, @Args('name') name: string, @Args('email') email: string) {
    return this.userService.updateUser(id, name, email);
  }

  @Mutation('deleteUser')
  async deleteUser(@Args('id') id: string) {
    return this.userService.deleteUser(id);
  }
}
