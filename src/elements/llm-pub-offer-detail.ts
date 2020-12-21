import { html, property, PropertyValues } from 'lit-element';
import { Button } from 'scoped-material-components/mwc-button';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';
import { sharedStyles } from '../sharedStyles';
import { Offer } from '../types';
import { BaseElement } from './base-element';

export class LlmPubOfferDetail extends BaseElement {
  /** Public attributes */

  /**
   * The offer to show the details of
   * This argument is mandatory, either in property or in attribute form
   */
  @property({ type: String, attribute: 'offer-hash' })
  offerHash!: string;

  /** Private properties */

  @property({ type: String })
  _myAgentPubKey!: string;

  @property({ type: Object })
  _offer!: Offer | undefined;

  @property({ type: Boolean })
  _accepting = false;

  @property({ type: Boolean })
  _rejecting = false;

  @property({ type: Boolean })
  _canceling = false;

  static styles = sharedStyles;

  updated(changedValues: PropertyValues) {
    super.updated(changedValues);

    if (
      (changedValues.has('membraneContext') && this.membraneContext.appWebsocket) ||
      (changedValues.has('offerHash') && this.offerHash)
    ) {
      this.loadOffer();
    }
  }

  /** Actions */

  async loadOffer() {
    this._offer = undefined as any;

    this._myAgentPubKey = await this._transactorService.getMyPublicKey();
    this._offer = await this._transactorService.queryOffer(this.offerHash);
  }

  async acceptOffer() {
    this._accepting = true;

    await this._transactorService.acceptOffer(this.offerHash);

    this.dispatchEvent(
      new CustomEvent('offer-completed', {
        detail: { offerHash: this.offerHash },
        composed: true,
        bubbles: true,
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
          ${this.renderAcceptOffer()}
        </div>
      </div>
    `;
  }

  renderCounterparty() {
    return html`
      <div class="row">
        <div class="column">
          <span class="item title">
            Offer ${this.isOutgoing() ? ' to ' : ' from '}
            ${this._offer?.recipient_pub_key}
          </span>
          <span class="item">Offer state: Pending</span>
          <span class="item">Agend ID: ${this._offer?.recipient_pub_key}</span>

          <span class="item">
            Transaction amount: ${this._offer?.amount} credits
          </span>

          <span class="item title" style="margin-top: 16px;"
            >${this._offer?.recipient_pub_key} current status</span
          >
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

  renderAcceptOffer() {
    if (this.isOutgoing()) {
      const buttonLabel =
        this._offer?.state === 'Pending'
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
          label="ACCEPT OFFER"
          raised
          @click=${() => this.acceptOffer()}
        ></mwc-button>
      `;
    }
  }

  /** Helpers */

  isOutgoing() {
    return this._offer?.spender_pub_key === this._myAgentPubKey;
  }

  static get scopedElements() {
    return {
      'mwc-button': Button,
      'mwc-circular-progress': CircularProgress,
    };
  }
}
