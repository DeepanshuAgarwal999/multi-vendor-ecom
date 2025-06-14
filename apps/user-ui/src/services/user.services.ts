import { gql } from '@apollo/client';
import { apolloClient } from '../configs/apolloClient';

export class UserService {
  static async signUp(data: any) {
    const USER_REGISTRATION = gql`
      mutation UserRegistration($name: String!, $email: String!) {
        userRegistration(name: $name, email: $email) {
          message
        }
      }
    `;
    const response = await apolloClient.mutate({
      mutation: USER_REGISTRATION,
      variables: {
        name: data.name,
        email: data.email,
      },
    });
    return {
      data: response.data.userRegistration,
    };
  }
  static async verifyRegistrationOtp(data: any) {
    const VERIFY_REGISTRATION_OTP = gql`
      mutation VerifyRegistrationOtp($email: String!, $otp: String!, $password: String!, $name: String!) {
        verifyRegistrationOtp(email: $email, otp: $otp, password: $password, name: $name) {
          message
        }
      }
    `;
    const response = await apolloClient.mutate({
      mutation: VERIFY_REGISTRATION_OTP,
      variables: {
        email: data.email,
        otp: data.otp,
        password: data.password,
        name: data.name,
      },
    });
    return {
      data: response.data.verifyRegistrationOtp,
    };
  }
  static async login(data: any) {
    const LOGIN_USER = gql`
      mutation LoginUser($email: String!, $password: String!) {
        loginUser(email: $email, password: $password) {
          user {
            id
            name
            email
          }
          message
        }
      }
    `;
    const response = await apolloClient.mutate({
      mutation: LOGIN_USER,
      variables: {
        email: data.email,
        password: data.password,
      },
    });
    return {
      data: response.data.loginUser,
    };
  }
  static async requestOtp({ email }: { email: string }) {
    const REQUEST_OTP = gql`
      mutation userForgotPassword($email: String!) {
        userForgotPassword(email: $email) {
          message
        }
      }
    `;
    const response = await apolloClient.mutate({
      mutation: REQUEST_OTP,
      variables: {
        email,
      },
    });
    return {
      data: response.data.requestOtp,
    };
  }
  static async verifyForgotPasswordOtp(data: any) {
    const VERIFY_FORGOT_PASSWORD_OTP = gql`
      mutation verifyForgotPasswordOtp($email: String!, $otp: String!) {
        verifyForgotPasswordOtp(email: $email, otp: $otp) {
          message
        }
      }
    `;
    const response = await apolloClient.mutate({
      mutation: VERIFY_FORGOT_PASSWORD_OTP,
      variables: {
        email: data.email,
        otp: data.otp,
      },
    });
    return {
      data: response.data.verifyForgotPasswordOtp,
    };
  }
  static async resetPassword({ email, newPassword }: { email: string; newPassword: string }) {
    const RESET_PASSWORD = gql`
      mutation userResetPassword($email: String!, $newPassword: String!) {
        userResetPassword(email: $email, newPassword: $newPassword) {
          message
        }
      }
    `;
    const response = await apolloClient.mutate({
      mutation: RESET_PASSWORD,
      variables: {
        email: email,
        newPassword: newPassword,
      },
    });
    return {
      data: response.data.userResetPassword,
    };
  }
  static async refreshToken() {
    const REFRESH_TOKEN = gql`
      query refreshTokenUser {
        refreshTokenUser {
          message
        }
      }
    `;
    const response = await apolloClient.query({
      query: REFRESH_TOKEN,
    });
    return { data: response.data.refreshTokenUser };
  }
}
