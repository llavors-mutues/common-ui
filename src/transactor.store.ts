import { Hashed } from '@holochain-open-dev/common';
import { Dictionary } from '@holochain-open-dev/common/core-types';
import { observable, action, flow, runInAction, computed } from 'mobx';
import { PublicTransactorService } from './public-transactor.service';
import { Offer, Transaction } from './types';

export class TransactorStore {
  @observable
  public offers: Dictionary<Offer> = {};
  @observable
  public transactions: Dictionary<Transaction> = {};
  @observable
  public _myAgentPubKey: string | undefined = undefined;

  constructor(protected transactorService: PublicTransactorService) {}

  @computed
  get myPendingOffers(): Hashed<Offer>[] {
    return Object.entries(this.offers).map(([hash, offer]) => ({
      hash,
      content: offer,
    }));
  }

  @computed
  get myTransactions(): Hashed<Transaction>[] {
    return Object.entries(this.transactions)
      .sort(
        ([_, transaction1], [__, transaction2]) =>
          transaction2.timestamp - transaction1.timestamp
      )
      .map(([hash, transaction]) => ({
        hash,
        content: transaction,
      }));
  }

  @computed
  isOutgoing(offer: Offer): boolean {
    return offer.spender_pub_key === this._myAgentPubKey;
  }

  @computed
  offer(offerHash: string): Offer {
    return this.offers[offerHash];
  }

  @computed
  get outgoingOffers(): Array<Hashed<Offer>> {
    return this.myPendingOffers.filter(offer => this.isOutgoing(offer.content));
  }

  @computed
  get incomingOffers(): Array<Hashed<Offer>> {
    return this.myPendingOffers.filter(
      offer => !this.isOutgoing(offer.content)
    );
  }

  @action
  public async fetchMyPendingOffers() {
    await this.fetchMyAgentPubKey();
    const offers = await this.transactorService.queryMyPendingOffers();

    runInAction(() => {
      for (const offer of offers) {
        this.offers[offer.hash] = offer.content;
      }
    });
  }

  @action
  public async fetchMyTransactions() {
    const transactions = await this.transactorService.getAgentTransactions(
      await this.fetchMyAgentPubKey()
    );

    for (const transaction of transactions) {
      this.transactions[transaction.hash] = transaction.content;
    }
  }

  @action
  public async fetchMyAgentPubKey() {
    if (this._myAgentPubKey) return this._myAgentPubKey;
    else {
      this._myAgentPubKey = await this.transactorService.getMyPublicKey();
      return this._myAgentPubKey;
    }
  }

  @action
  public async createOffer(
    recipientPubKey: string,
    amount: number
  ): Promise<void> {
    await this.transactorService.createOffer(recipientPubKey, amount);

    this.fetchMyPendingOffers();
  }

  @action
  public async acceptOffer(offerHash: string): Promise<void> {
    await this.transactorService.acceptOffer(offerHash);

    runInAction(() => {
      delete this.offers[offerHash];
      this.fetchMyTransactions();
    });
  }
}
