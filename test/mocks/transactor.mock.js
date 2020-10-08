import { hashToString, randomHash } from 'holochain-ui-test-utils';

export class PublicTransactorMock {
  constructor() {
    this.offers = {};
    this.transactions = {};
  }

  create_offer({ amount, recipient_pub_key }, provenance) {
    const newId = hashToString(randomHash());

    this.offers[newId] = {
      state: 'Pending',
      spender_pub_key: hashToString(provenance),
      recipient_pub_key: recipient_pub_key,
      amount: amount,
    };

    return [newId, this.offers[newId]];
  }

  cancel_offer({ offer_hash }) {
    this.offers[offer_hash].status = 'Canceled';
  }

  accept_offer({ offer_hash }) {
    this.offers[offer_hash].status = 'Completed';

    const newId = hashToString(randomHash());
    const transaction = {
      ...this.offers[offer_hash],
      timestamp: [Math.floor(Date.now() / 1000)],
    };
    this.transactions[newId] = transaction;

    return [newId, transaction];
  }

  query_my_balance(params, provenance) {
    return this.query_my_transactions(params, provenance).reduce(
      (acc, next) => acc + this.getPartialBalance(next[1], provenance),
      0
    );
  }

  getPartialBalance(transaction, provenance) {
    if (transaction.spender_pub_key === hashToString(provenance))
      return -transaction.amount;
    else if (transaction.recipient_pub_key === hashToString(provenance))
      return transaction.amount;
  }

  isMine(offerOrTransaction, provenance) {
    const stringHash = hashToString(provenance);

    return (
      offerOrTransaction.recipient_pub_key === stringHash ||
      offerOrTransaction.spender_pub_key === stringHash
    );
  }

  query_all_my_offers(params, provenance) {
    return Object.entries(this.offers).filter(([_, offer]) =>
      this.isMine(offer, provenance)
    );
  }

  query_my_pending_offers(params, provenance) {
    return this.query_all_my_offers(params, provenance).filter(
      offer => offer[1].state === 'Pending'
    );
  }

  query_my_transactions(params, provenance) {
    return Object.entries(this.transactions).filter(([_, transaction]) =>
      this.isMine(transaction, provenance)
    );
  }
}
