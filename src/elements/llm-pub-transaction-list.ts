import { LitElement, property, html } from 'lit-element';
import { ApolloClient } from '@apollo/client/core';

import '@material/mwc-list';
import '@material/mwc-circular-progress';
import type { Agent } from 'holochain-profiles-username';

import { GET_MY_TRANSACTIONS } from '../graphql/queries';
import type { Transaction } from '../types';
import { sharedStyles } from '../sharedStyles';
import { dateString } from '../utils';

export abstract class LlmPubTransactionList extends LitElement {
  /** Public attributes */

  /** Dependencies */
  abstract _apolloClient: ApolloClient<any>;

  /** Private properties */

  @property({ type: String })
  _myAgentId!: string;

  @property({ type: Object, attribute: false })
  _transactions!: Array<Transaction>;

  static styles = sharedStyles;

  async firstUpdated() {
    const result = await this._apolloClient.query({
      query: GET_MY_TRANSACTIONS,
      fetchPolicy: 'network-only',
    });

    this._myAgentId = result.data.me.id;
    this._transactions = result.data.me.transactions.sort(
      (t1: Transaction, t2: Transaction) => t2.timestamp - t1.timestamp
    );
  }

  isOutgoing(transaction: Transaction) {
    return transaction.spender.id === this._myAgentId;
  }

  getCounterparty(transaction: Transaction): Agent {
    return transaction.recipient.id === this._myAgentId
      ? transaction.spender
      : transaction.recipient;
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
                  @${this.getCounterparty(transaction).username} on
                  ${dateString(transaction.timestamp)}
                </span>
                <span slot="secondary"
                  >${this.getCounterparty(transaction).id}
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
                ${this.isOutgoing(transaction) ? '-' : '+'}${transaction.amount}
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
}
