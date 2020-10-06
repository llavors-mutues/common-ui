import { randomHash } from './utils';

export class PublicTransactorMock {
  constructor() {
    this.myAddress = randomHash();
    this.offers = {};
    this.transactions = {};
  }

  create_offer({ amount, recipient_pub_key }) {
    const newId = randomHash();

    this.offers[newId] = {
      status: 'Pending',
      spender: this.myAddress,
      recipient: recipient_pub_key,
      amount: amount,
    };

    return { id: newId, ...this.offers[newId] };
  }

  cancel_offer({ offer_hash }) {
    this.offers[offer_hash].status = 'Canceled';
  }

  accept_offer({ offer_hash }) {
    this.offers[offer_hash].status = 'Completed';

    const newId = randomHash();
    const transaction = {
      ...this.offers[offer_hash],
      timestamp: [Math.floor(Date.now() / 1000)],
    };
    this.transactions[newId] = transaction;

    return {
      id: newId,
      ...transaction,
    };
  }

  query_my_balance() {
    return Object.values(this.transactions).reduce(
      (acc, next) => acc + next.amount,
      0
    );
  }

  query_all_my_offers() {
    return Object.entries(this.offers);
  }

  query_my_pending_offers() {
    return this.query_all_my_offers().filter(
      offer => offer[1].status === 'Pending'
    );
  }
}
