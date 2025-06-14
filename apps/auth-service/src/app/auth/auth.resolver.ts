import { Args, Mutation, Resolver, Query, Context } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { validateRegistrationData } from '../../utils/auth.helper';
import { Request, response, Response } from 'express';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Resolver('User')
export class AuthResolver {
  constructor(private userService: AuthService) {}

  @Query('users')
  async getAllUsers() {
    return this.userService.getAllUsers();
  }

  @UseGuards(JwtAuthGuard)
  @Query('getLoggedInUser')
  async getLoggedInUser(@Context() context: any) {
    const { req } = context;
    return this.userService.getUser(req);
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
  async loginUser(
    @Args('email') email: string,
    @Args('password') password: string,
    @Context() context: { req: Request; res: Response }
  ) {
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
  async verifyForgotPasswordOtp(@Args('email') email: string, @Args('otp') otp: string) {
    return this.userService.verifyForgotPasswordOtp({ email, otp });
  }

  @Query('refreshTokenUser')
  async refreshToken(@Context() context: { req: Request; res: Response }) {
    const { req, res } = context;
    return this.userService.refreshToken(req, res);
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
