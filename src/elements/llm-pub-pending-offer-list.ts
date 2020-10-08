import { LitElement, html, property, css } from 'lit-element';
import { ApolloClient } from '@apollo/client/core';

import '@material/mwc-list';
import '@material/mwc-circular-progress';
import { Agent } from 'holochain-profiles-username';

import { GET_MY_PENDING_OFFERS } from '../graphql/queries';
import { Offer } from '../types';
import { sharedStyles } from '../sharedStyles';

export abstract class LlmPubPendingOfferList extends LitElement {
  /** Public attributes */

  /** Dependencies */
  abstract _apolloClient: ApolloClient<any>;

  /** Private properties */

  @property({ type: String })
  _myAgentId!: string;

  @property({ type: Object })
  _offers!: Offer[];

  @property({ type: String })
  _lastSelectedOfferId: string | undefined = undefined;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
      }
    `,
  ];

  async firstUpdated() {
    this._apolloClient
      .watchQuery({
        query: GET_MY_PENDING_OFFERS,
        fetchPolicy: 'network-only',
      })
      .subscribe(result => {
        this._myAgentId = result.data.me.id;
        this._offers = result.data.me.offers.filter(
          (offer: Offer) =>
            offer.state !== 'Completed' && offer.state !== 'Canceled'
        );
      });
  }

  renderPlaceholder(type: string) {
    return html`<span style="padding-top: 16px;">
      You have no ${type.toLowerCase()} offers
    </span>`;
  }

  offerSelected(offerId: string) {
    this.dispatchEvent(
      new CustomEvent('offer-selected', {
        detail: { offerId, composed: true, bubbles: true },
      })
    );
    this._lastSelectedOfferId = offerId;
  }

  isOutgoing(offer: Offer): boolean {
    return offer.spender.id === this._myAgentId;
  }

  getOutgoing(): Offer[] {
    return this._offers.filter(offer => this.isOutgoing(offer));
  }

  getIncoming(): Offer[] {
    return this._offers.filter(offer => !this.isOutgoing(offer));
  }

  counterparty(offer: Offer): Agent {
    return offer.recipient.id === this._myAgentId
      ? offer.spender
      : offer.recipient;
  }

  renderOfferList(title: string, offers: Offer[]) {
    return html`<div class="column">
      <span class="title">${title} offers</span>

      ${offers.length === 0
        ? this.renderPlaceholder(title)
        : html`
            <mwc-list>
              ${offers.map(
                (offer, index) => html`
                  <mwc-list-item
                    @click=${() => this.offerSelected(offer.id)}
                    graphic="avatar"
                    twoline
                    .activated=${this._lastSelectedOfferId
                      ? this._lastSelectedOfferId === offer.id
                      : false}
                  >
                    <span>
                      ${offer.amount} credits
                      ${this.isOutgoing(offer) ? 'to' : 'from'}
                      @${this.counterparty(offer).username}
                    </span>

                    <mwc-icon
                      slot="graphic"
                      .style="color: ${this.isOutgoing(offer)
                        ? 'red'
                        : 'green'}"
                      >${this.isOutgoing(offer)
                        ? 'call_made'
                        : 'call_received'}</mwc-icon
                    >
                  </mwc-list-item>
                  ${index < offers.length - 1
                    ? html`<li divider padded role="separator"></li> `
                    : html``}
                `
              )}
            </mwc-list>
          `}
    </div>`;
  }

  render() {
    if (!this._offers)
      return html`<div class="column fill center-content">
        <mwc-circular-progress></mwc-circular-progress>
        <span class="placeholder" style="margin-top: 18px;"
          >Fetching pending offers...</span
        >
      </div>`;

    return html`<div class="column fill">
      <div style="margin-bottom: 24px;">
        ${this.renderOfferList('Incoming', this.getIncoming())}
      </div>
      ${this.renderOfferList('Outgoing', this.getOutgoing())}
    </div>`;
  }
}
