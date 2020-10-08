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

  cancel_offer({ offer_hash }, provenance) {
    const offer = this.offers[offer_hash];

    if (offer.spender_pub_key !== hashToString(provenance))
      throw new Error('Cannot cancel an offer you did not create');

    offer.status = 'Canceled';
  }

  reject_offer({ offer_hash }, provenance) {
    const offer = this.offers[offer_hash];

    if (offer.recipient_pub_key !== hashToString(provenance))
      throw new Error('Cannot reject an offer you did not receive');

    offer.status = 'Rejected';
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

  query_all_my_offers(params, provenance) {
    return Object.entries(this.offers).filter(([_, offer]) =>
      this.isOfAgent(offer, hashToString(provenance))
    );
  }

  query_my_pending_offers(params, provenance) {
    return this.query_all_my_offers(params, provenance).filter(
      offer => offer[1].state === 'Pending'
    );
  }

  get_transactions_for_agent({ agent_pub_key }) {
    return Object.entries(this.transactions).filter(([_, transaction]) =>
      this.isOfAgent(transaction, agent_pub_key)
    );
  }

  get_balance_for_agent({ agent_pub_key }) {
    return this.get_transactions_for_agent({ agent_pub_key }).reduce(
      (acc, next) => acc + this.getPartialBalance(next[1], agent_pub_key),
      0
    );
  }

  /** Private helpers */

  getPartialBalance(transaction, agent_pub_key) {
    if (transaction.spender_pub_key === agent_pub_key)
      return -transaction.amount;
    else if (transaction.recipient_pub_key === agent_pub_key)
      return transaction.amount;
  }

  isOfAgent(offerOrTransaction, agent_pub_key) {
    const stringHash = agent_pub_key;

    return (
      offerOrTransaction.recipient_pub_key === stringHash ||
      offerOrTransaction.spender_pub_key === stringHash
    );
  }
}
