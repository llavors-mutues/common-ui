import { LitElement, property, html } from 'lit-element';
import { Hashed } from '@holochain-open-dev/common';

import { List } from 'scoped-material-components/mwc-list';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';

import type { Transaction } from '../types';
import { sharedStyles } from '../sharedStyles';
import { dateString } from '../utils';
import { BaseElement } from './base-element';
import { Icon } from 'scoped-material-components/mwc-icon';
import { ListItem } from 'scoped-material-components/mwc-list-item';

export abstract class LlmPubTransactionList extends BaseElement {
  /** Public attributes */

  /** Private properties */

  @property({ type: String })
  _myAgentPubKey!: string;

  @property({ type: Object, attribute: false })
  _transactions!: Array<Hashed<Transaction>>;

  static styles = sharedStyles;

  async loadTransactions() {
    this._myAgentPubKey = await this._transactorService.getMyPublicKey();
    this._transactions = await this._transactorService.getAgentTransactions(
      this._myAgentPubKey
    );

    this._transactions = this._transactions.sort(
      (t1, t2) => t2.content.timestamp - t1.content.timestamp
    );
  }

  isOutgoing(transaction: Hashed<Transaction>) {
    return transaction.content.spender_pub_key === this._myAgentPubKey;
  }

  getCounterparty(transaction: Hashed<Transaction>): string {
    return transaction.content.recipient_pub_key === this._myAgentPubKey
      ? transaction.content.spender_pub_key
      : transaction.content.recipient_pub_key;
  }

  render() {
    return html`<div class="column center-content">
      ${this.renderContent()}
    </div>`;
  }

  renderContent() {
    if (!this._transactions)
      return html`
        <div class="padding center-content column">
          <mwc-circular-progress></mwc-circular-progress>
          <span class="placeholder" style="margin-top: 18px;"
            >Fetching transaction history...</span
          >
        </div>
      `;

    if (this._transactions.length === 0)
      return html`<div class="padding">
        <span>You have no transactions in your history</span>
      </div>`;

    return html`
      <mwc-list style="width: 100%;">
        ${this._transactions.map(
          (transaction, i) => html`
            <div class="row" style="align-items: center;">
              <mwc-list-item
                twoline
                noninteractive
                graphic="avatar"
                style="flex: 1;"
              >
                <span>
                  ${this.isOutgoing(transaction) ? 'To ' : 'From '}
                  @${this.getCounterparty(transaction)} on
                  ${dateString(transaction.content.timestamp)}
                </span>
                <span slot="secondary"
                  >${this.getCounterparty(transaction)}
                </span>
                <mwc-icon
                  slot="graphic"
                  .style="color: ${this.isOutgoing(transaction)
                    ? 'red'
                    : 'green'}"
                  >${this.isOutgoing(transaction)
                    ? 'call_made'
                    : 'call_received'}</mwc-icon
                >
              </mwc-list-item>

              <span style="font-size: 20px; margin-right: 24px;">
                ${this.isOutgoing(transaction) ? '-' : '+'}${transaction.content
                  .amount}
                credits
              </span>
            </div>
            ${i < this._transactions.length - 1
              ? html`<li divider padded role="separator"></li> `
              : html``}
          `
        )}
      </mwc-list>
    `;
  }

  static get scopedElements() {
    return {
      'mwc-circular-progress': CircularProgress,
      'mwc-icon': Icon,
      'mwc-list-item': ListItem,
      'mwc-list': List,
    };
  }
}
