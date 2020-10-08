import { LitElement, html, property, css, PropertyValues } from 'lit-element';
import { sharedStyles } from '../sharedStyles';
import { ApolloClient } from '@apollo/client/core';
import {
  GET_OFFER_DETAIL,
  ACCEPT_OFFER,
  CANCEL_OFFER,
  GET_MY_PENDING_OFFERS,
  REJECT_OFFER,
} from '../graphql/queries';
import { AgentWithBalance, OfferDetail } from '../types';

/**
 * General flow for the component
 *
 * From the point of view of the spender:
 * Pending --Recipient has accepted--> Completed
 *
 * From the point of view of the recipient:
 * Pending --Accept--> Completed
 * Pending --Reject--> Reject
 */
export abstract class LlmPubOfferDetail extends LitElement {
  /** Public attributes */

  /**
   * The offer to show the details of
   * This argument is mandatory, either in property or in attribute form
   */
  @property({ type: String, attribute: 'offer-id' })
  offerId!: string;

  /** Dependencies */
  abstract _apolloClient: ApolloClient<any>;

  /** Private properties */

  @property({ type: String })
  _myAgentId!: string;

  @property({ type: Object })
  _offer!: OfferDetail;

  @property({ type: Boolean })
  _accepting = false;

  @property({ type: Boolean })
  _rejecting = false;

  @property({ type: Boolean })
  _canceling = false;

  static styles = sharedStyles;

  updated(changedValues: PropertyValues) {
    super.updated(changedValues);

    if (changedValues.has('offerId') && this.offerId !== null) {
      this.loadOffer();
    }
  }

  /** Actions */

  async loadOffer() {
    const loadingTransactionId = this.offerId;
    this._offer = undefined as any;

    const result = await this._apolloClient.query({
      query: GET_OFFER_DETAIL,
      variables: {
        offerId: this.offerId,
      },
      fetchPolicy: 'network-only',
    });

    if (loadingTransactionId === this.offerId) {
      this._offer = result.data.offer;
      this._myAgentId = result.data.me.id;
    }
  }

  acceptOffer() {
    const offerId = this.offerId;

    this._accepting = true;

    this._apolloClient
      .mutate({
        mutation: ACCEPT_OFFER,
        variables: {
          offerId,
        },
        update: (cache, result) => {
          const pendingOffers: any = cache.readQuery({
            query: GET_MY_PENDING_OFFERS,
          });

          pendingOffers.myPendingOffers.find(
            (o: OfferDetail) => o.id === offerId
          ).state = 'Completed';

          cache.writeQuery({
            query: GET_MY_PENDING_OFFERS,
            data: pendingOffers,
          });
        },
      })
      .then(() => {
        this.dispatchEvent(
          new CustomEvent('offer-completed', {
            detail: { offerId },
            composed: true,
            bubbles: true,
          })
        );
      })
      .catch(() => {
        this.dispatchEvent(
          new CustomEvent('offer-failed-to-complete', {
            detail: { offerId },
            composed: true,
            bubbles: true,
          })
        );
        this.loadOffer();
      })
      .finally(() => (this._accepting = false));
  }

  rejectOffer() {
    this._rejecting = true;
    const offerId = this.offerId;

    this._apolloClient
      .mutate({
        mutation: REJECT_OFFER,
        variables: {
          offerId,
        },
      })
      .then(() => {
        this.dispatchEvent(
          new CustomEvent('offer-rejected', {
            detail: { offerId },
            composed: true,
            bubbles: true,
          })
        );
        this.loadOffer();
      })
      .finally(() => (this._rejecting = false));
  }

  async cancelOffer() {
    const offerId = this.offerId;
    (this._canceling = true),
      await this._apolloClient.mutate({
        mutation: CANCEL_OFFER,
        variables: {
          offerId,
        },
        update: (cache, result) => {
          const pendingOffers: any = cache.readQuery({
            query: GET_MY_PENDING_OFFERS,
          });

          const offers = pendingOffers.myPendingOffers.filter(
            (o: OfferDetail) => o.id !== offerId
          );

          pendingOffers.myPendingOffers = offers;

          cache.writeQuery({
            query: GET_MY_PENDING_OFFERS,
            data: pendingOffers,
          });
        },
      });

    this.dispatchEvent(
      new CustomEvent('offer-canceled', {
        detail: { offerId },
        bubbles: true,
        composed: true,
      })
    );
  }

  /** Renders */

  render() {
    if (!this._offer || this._accepting || this._canceling || this._rejecting)
      return html`<div class="column fill center-content">
        <mwc-circular-progress></mwc-circular-progress>
        <span style="margin-top: 18px;" class="placeholder"
          >${this.placeholderMessage()}</span
        >
      </div>`;

    return html`
      <div class="column">
        ${this.renderCounterparty()}
        <div class="row center-content" style="margin-top: 24px;">
          <mwc-button
            .label=${(this.isOutgoing() ? 'CANCEL' : 'REJECT') + ' OFFER'}
            style="flex: 1; margin-right: 16px;"
            @click=${() =>
              this.isOutgoing() ? this.cancelOffer() : this.rejectOffer()}
          ></mwc-button>
          ${this.renderOfferForwardAction()}
        </div>
      </div>
    `;
  }

  renderCounterparty() {
    const counterparty = this.getCounterparty();
    return html`
      <div class="row">
        <div class="column">
          <span class="item title">
            Offer ${this.isOutgoing() ? ' to ' : ' from '}
            ${this.getCounterpartyUsername()}
          </span>
          <span class="item">Offer state: ${this._offer.state}</span>
          <span class="item">Agend ID: ${counterparty.id}</span>

          <span class="item">
            Transaction amount: ${this._offer.amount} credits
          </span>

          <span class="item title" style="margin-top: 16px;"
            >${this.getCounterpartyUsername()} current status</span
          >
          <span class="item">
            Balance:
            ${counterparty.balance > 0 ? '+' : ''}${counterparty.balance}
            credits
          </span>
        </div>
      </div>
    `;
  }

  placeholderMessage() {
    if (this._accepting) return 'Accepting offer...';
    if (this._canceling) return 'Canceling offer...';
    if (this._rejecting) return 'Rejecting offer...';
    return 'Loading offer...';
  }

  renderOfferForwardAction() {
    if (this.isOutgoing() || this._offer.state !== 'Pending') {
      const buttonLabel =
        this._offer.state === 'Pending'
          ? 'Awaiting for approval'
          : 'Offer is no longer pending';

      return html`<mwc-button
        style="flex: 1;"
        .label=${buttonLabel}
        disabled
        raised
      >
      </mwc-button>`;
    } else {
      return html`
        <mwc-button
          style="flex: 1;"
          label="ACCEPT AND COMPLETE TRANSACTION"
          raised
          @click=${() => this.acceptOffer()}
        ></mwc-button>
      `;
    }
  }

  /** Helpers */

  isOutgoing() {
    return this._offer.spender.id === this._myAgentId;
  }

  getCounterparty(): AgentWithBalance {
    return this._offer.recipient.id === this._myAgentId
      ? this._offer.spender
      : this._offer.recipient;
  }

  getCounterpartyUsername(): string {
    return `@${this.getCounterparty().username}`;
  }
}
