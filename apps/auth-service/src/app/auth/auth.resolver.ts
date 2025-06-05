import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
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
  async userRegistration(@Args('name') name: string, @Args('email') email: string) {
    validateRegistrationData({ name, email }, 'user');
    await this.userService.userRegistration({ name, email });
    return {
      message: 'OTP sent to email, please check your email for verification',
    };
  }

  @Mutation('verifyRegistrationOtp')
  async verifyRegistrationOtp(
    @Args('email') email: string,
    @Args('otp') otp: string,
    @Args('password') password: string,
    @Args('name') name: string
  ) {
    return this.userService.verifyRegistrationOtp({ email, otp, password, name });
  }

  @Mutation('loginUser')
  async loginUser(@Args('email') email: string, @Args('password') password: string, @Context() context: any) {
    const response = context.res;
    return this.userService.loginUser(email, password, response);
  }

  @Mutation('userForgotPassword')
  async userForgotPassword(@Args('email') email: string) {
    return this.userService.userForgotPassword(email);
  }
  @Mutation('userResetPassword')
  async userResetPassword(@Args('email') email: string, @Args('newPassword') newPassword: string) {
    return this.userService.userResetPassword(email, newPassword);
  }

  @Mutation('verifyForgotPasswordOtp')
  async verifyForgotPasswordOtp(
    @Args('email') email: string,
    @Args('otp') otp: string,
    @Args('newPassword') password: string
  ) {
    return this.userService.verifyForgotPasswordOtp({ email, otp });
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
