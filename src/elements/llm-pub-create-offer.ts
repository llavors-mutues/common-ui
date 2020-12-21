import { LitElement, html, property, query } from 'lit-element';

import { TextField } from 'scoped-material-components/mwc-textfield';
import { Button } from 'scoped-material-components/mwc-button';

import { sharedStyles } from '../sharedStyles';
import { BaseElement } from './base-element';

export class LlmPubCreateOffer extends BaseElement {
  /** Public attributes */

  /**
   * Whether the dialog is open or not
   */
  @property({ type: Boolean })
  open = false;

  // The recipient agent of the offer. If not given, will enable the recipient field of the form
  @property({ type: String })
  recipientPubKey: string | undefined = undefined;

  /** Private properties */

  @query('#amount')
  _amountField!: TextField;

  @query('#creditor')
  _recipientField!: TextField;

  static styles = sharedStyles;

  firstUpdated() {
    this._amountField.validityTransform = newValue => {
      this.requestUpdate();
      try {
        const amount = parseFloat(newValue);
        if (amount > 0) return { valid: true };
      } catch (e) {}
      this._amountField.setCustomValidity(
        `Offer amount has to be greater than 0`
      );
      return {
        valid: false,
      };
    };
  }

  async createOffer() {
    const recipientPubKey = this._recipientField.value;
    const amount = parseFloat(this._amountField.value);
    
    await this._transactorService.createOffer(recipientPubKey, amount);

    this.dispatchEvent(
      new CustomEvent('offer-created', {
        detail: { recipientPubKey, amount },
        composed: true,
        bubbles: true,
      })
    );
  }

  render() {
    return html`
      <mwc-dialog
        .open=${this.open}
        @closed=${() => (this.open = false)}
        heading="Create New Offer"
      >
        <div class="column center-content">
          <span>
            You are about to create an offer
            ${this.recipientPubKey ? `to @${this.recipientPubKey}` : ''}, which
            would lower your balance by the amount of the transaction and raise
            the creditor's value by the same amount.
          </span>
          <mwc-textfield
            .disabled=${this.recipientPubKey !== undefined}
            .value=${this.recipientPubKey ? this.recipientPubKey : ''}
            style="padding: 16px 0; width: 24em;"
            id="creditor"
            label="Creditor"
            autoValidate
            outlined
          ></mwc-textfield>

          <mwc-textfield
            style="padding-top: 16px;"
            label="Amount"
            type="number"
            id="amount"
            min="0.1"
            step="0.1"
            autoValidate
            outlined
          ></mwc-textfield>
        </div>

        <mwc-button slot="secondaryAction" dialogAction="cancel">
          Cancel
        </mwc-button>
        <mwc-button
          .disabled=${!this._amountField || !this._amountField.validity.valid}
          slot="primaryAction"
          @click=${() => this.createOffer()}
          dialogAction="create"
        >
          Create Offer
        </mwc-button>
      </mwc-dialog>
    `;
  }

  static get scopedElements() {
    return {
      'mwc-textfield': TextField,
      'mwc-button': Button,
    };
  }
}
