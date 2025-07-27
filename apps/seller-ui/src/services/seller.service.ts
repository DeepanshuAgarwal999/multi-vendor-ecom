import { gql } from '@apollo/client';
import { apolloClient } from '../config/apollo-client';

export class SellerService {
  static async signUp(data: any) {
    const SELLER_REGISTRATION = gql`
      mutation SellerRegistration($name: String!, $email: String!) {
        sellerRegistration(name: $name, email: $email) {
          message
        }
      }
    `;
    const response = await apolloClient.mutate({
      mutation: SELLER_REGISTRATION,
      variables: {
        name: data.name,
        email: data.email,
      },
    });
    return {
      data: response.data.userRegistration,
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

  static async verifyRegistrationOtp(data: {
    email: string;
    otp: string;
    password: string;
    name: string;
    phone_number: string;
    country: string;
  }) {
    const VERIFY_SELLER = gql`
      mutation verifySeller(
        $email: String!
        $otp: String!
        $password: String!
        $name: String!
        $phone_number: String!
        $country: String!
      ) {
        verifySeller(
          email: $email
          otp: $otp
          password: $password
          name: $name
          phone_number: $phone_number
          country: $country
        ) {
          message
        }
      }
    `;
    const response = await apolloClient.mutate({
      mutation: VERIFY_SELLER,
      variables: {
        email: data.email,
        otp: data.otp,
        password: data.password,
        name: data.name,
        phone_number: data.phone_number,
        country: data.country,
      },
    });
    return {
      data: response.data.verifySeller,
    };
  }

  static async createShop(data: any) {
    const CREATE_SHOP = gql`
      mutation CreateShop(
        $name: String!
        $address: String!
        $bio: String!
        $opening_hours: String!
        $sellerId: ID!
        $category: String!
        $website: String
      ) {
        createShop(
          name: $name
          address: $address
          bio: $bio
          opening_hours: $opening_hours
          sellerId: $sellerId
          category: $category
          website: $website
        ) {
          id
          name
          address
          bio
          opening_hours
          sellerId
          website
          category
        }
      }
    `;
    const response = await apolloClient.mutate({
      mutation: CREATE_SHOP,
      variables: {
        name: data.name,
        address: data.address,
        bio: data.bio,
        opening_hours: data.opening_hours,
        sellerId: data.sellerId,
        category: data.category,
        website: data.website,
      },
    });
    return {
      data: response.data.createShop,
    };
  }
}
