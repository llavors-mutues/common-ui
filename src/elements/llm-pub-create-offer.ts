import { LitElement, html, property, query } from 'lit-element';
import { ApolloClient } from '@apollo/client/core';
import { CREATE_OFFER } from '../graphql/queries';

import { Agent } from 'holochain-profiles-username';
import '@material/mwc-textfield';
import '@material/mwc-button';
import type { TextFieldBase } from '@material/mwc-textfield/mwc-textfield-base';

import { sharedStyles } from '../sharedStyles';

export abstract class LlmPubCreateOffer extends LitElement {
  /** Public attributes */

  /**
   * Whether the dialog is open or not
   */
  @property({ type: Boolean })
  open = false;

  // The recipient agent of the offer. If not given, will enable the recipient field of the form
  @property({ type: String })
  recipient: Agent | undefined = undefined;

  /** Dependencies */
  abstract _apolloClient: ApolloClient<any>;

  /** Private properties */

  @query('#amount')
  _amountField!: TextFieldBase;

  @query('#creditor')
  _recipientField!: TextFieldBase;

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
    const recipientId = this._recipientField.value;
    const amount = parseFloat(this._amountField.value);
    await this._apolloClient.mutate({
      mutation: CREATE_OFFER,
      variables: {
        recipientId,
        amount,
      },
    });

    this.dispatchEvent(
      new CustomEvent('offer-created', {
        detail: { recipientId, amount },
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
            ${this.recipient ? `to @${this.recipient.username}` : ''}, which
            would lower your balance by the amount of the transaction and raise
            the creditor's value by the same amount.
            <br /><br />
            This will let the creditor scan your source chain to validate your
            transaction history.
          </span>
          <mwc-textfield
            .disabled=${this.recipient !== undefined}
            .value=${this.recipient ? this.recipient.id : ''}
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
}
