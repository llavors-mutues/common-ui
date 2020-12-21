import { LitElement, html, property, css, PropertyValues } from 'lit-element';

import { List } from 'scoped-material-components/mwc-list';
import { ListItem } from 'scoped-material-components/mwc-list-item';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';

import { Offer } from '../types';
import { sharedStyles } from '../sharedStyles';
import { BaseElement } from './base-element';
import { Hashed } from '@holochain-open-dev/common';

export class LlmPubPendingOfferList extends BaseElement {
  /** Public attributes */

  /** Private properties */

  @property({ type: String })
  _myAgentId!: string;

  @property({ type: Object })
  _offers!: Array<Hashed<Offer>>;

  @property({ type: String })
  _lastSelectedOfferHash: string | undefined = undefined;

  static styles = [
    sharedStyles,
    css`
      :host {
        display: flex;
      }
    `,
  ];

  async loadOffers() {
    this._offers = await this._transactorService.queryMyPendingOffers();
    this._myAgentId = await this._transactorService.getMyPublicKey();
  }

  async updated(changedValues: PropertyValues) {
    super.updated(changedValues);
    if (changedValues.has('membraneContext') && this.membraneContext) {
      this.loadOffers();
    }
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
    this._lastSelectedOfferHash = offerId;
  }

  isOutgoing(offer: Hashed<Offer>): boolean {
    return offer.content.spender_pub_key === this._myAgentId;
  }

  getOutgoing(): Array<Hashed<Offer>> {
    return this._offers.filter(offer => this.isOutgoing(offer));
  }

  getIncoming(): Array<Hashed<Offer>> {
    return this._offers.filter(offer => !this.isOutgoing(offer));
  }

  counterparty(offer: Hashed<Offer>): string {
    return offer.content.recipient_pub_key === this._myAgentId
      ? offer.content.spender_pub_key
      : offer.content.recipient_pub_key;
  }

  renderOfferList(title: string, offers: Array<Hashed<Offer>>) {
    return html`<div class="column">
      <span class="title">${title} offers</span>

      ${offers.length === 0
        ? this.renderPlaceholder(title)
        : html`
            <mwc-list>
              ${offers.map(
                (offer, index) => html`
                  <mwc-list-item
                    @click=${() => this.offerSelected(offer.hash)}
                    graphic="avatar"
                    twoline
                    .activated=${this._lastSelectedOfferHash
                      ? this._lastSelectedOfferHash === offer.hash
                      : false}
                  >
                    <span>
                      ${offer.content.amount} credits
                      ${this.isOutgoing(offer) ? 'to' : 'from'}
                      ${this.counterparty(offer)}
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

  static get scopedElements() {
    return {
      'mwc-circular-progress': CircularProgress,
      'mwc-list': List,
      'mwc-list-item': ListItem,
    };
  }
}
