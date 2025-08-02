import { Inject, Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private stripe: Stripe;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-07-30.basil',
    });
  }

  async getCustomers() {
    const customers = await this.stripe.customers.list({});
    return customers.data;
  }

  async createConnectAccount({ email }: { email: string }) {
    return this.stripe.accounts.create({
      type: 'express',
      email,
      country: 'IN',
      capabilities: {
        card_payments: {
          requested: true,
        },
        transfers: {
          requested: true,
        },
      },
    });
  }

  async createAccountLink(accountId: string) {
    return this.stripe.accountLinks.create({
      account: accountId,
      refresh_url: 'http://localhost:3000/sucess',
      return_url: 'http://localhost:3000/sucess',
      type: 'account_onboarding',
    });
  }
}
