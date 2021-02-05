import { LitElement, property, html, PropertyValues } from 'lit-element';
import { Hashed } from '@holochain-open-dev/common';

import { List } from 'scoped-material-components/mwc-list';
import { CircularProgress } from 'scoped-material-components/mwc-circular-progress';

import type { Transaction } from '../types';
import { sharedStyles } from './utils/shared-styles';
import { dateString } from '../utils';
import { BaseElement } from './utils/base-element';
import { Icon } from 'scoped-material-components/mwc-icon';
import { ListItem } from 'scoped-material-components/mwc-list-item';

export abstract class TransactionList extends BaseElement {
  /** Public attributes */

  /** Private properties */

  @property({ type: Boolean })
  _loading = true;

  static styles = sharedStyles;

  async firstUpdated() {
    await this.transactorStore.fetchMyTransactions();
    this._loading = false;
  }

  render() {
    return html`<div class="column center-content">
      ${this.renderContent()}
    </div>`;
  }

  renderContent() {
    if (this._loading)
      return html`
        <div class="padding center-content column">
          <mwc-circular-progress indeterminate></mwc-circular-progress>
          <span class="placeholder" style="margin-top: 18px;"
            >Fetching transaction history...</span
          >
        </div>
      `;

    const myTransactions = this.transactorStore.myTransactions;

    if (myTransactions.length === 0)
      return html`<div class="padding">
        <span class="placeholder">You have no transactions in your history</span>
      </div>`;

    return html`
      <mwc-list style="width: 100%;">
        ${myTransactions.map(
          (transaction, i) => html`
            <div class="row" style="align-items: center;">
              <mwc-list-item
                twoline
                noninteractive
                graphic="avatar"
                style="flex: 1;"
              >
                <span>
                  ${this.transactorStore.isOutgoing(transaction.content)
                    ? 'To '
                    : 'From '}
                  ${this.transactorStore.counterpartyNickname(
                    transaction.content
                  )}
                  on ${dateString(transaction.content.timestamp)}
                </span>
                <span slot="secondary"
                  >${this.transactorStore.counterpartyKey(transaction.content)}
                </span>
                <mwc-icon
                  slot="graphic"
                  .style="color: ${this.transactorStore.isOutgoing(
                    transaction.content
                  )
                    ? 'red'
                    : 'green'}"
                  >${this.transactorStore.isOutgoing(transaction.content)
                    ? 'call_made'
                    : 'call_received'}</mwc-icon
                >
              </mwc-list-item>

              <span style="font-size: 20px; margin: 0 24px;">
                ${this.transactorStore.isOutgoing(transaction.content)
                  ? '-'
                  : '+'}${transaction.content.amount}
                credits
              </span>
            </div>
            ${i < myTransactions.length - 1
              ? html`<li divider padded role="separator"></li> `
              : html``}
          `
        )}
      </mwc-list>
    `;
  }

  getScopedElements() {
    return {
      'mwc-circular-progress': CircularProgress,
      'mwc-icon': Icon,
      'mwc-list-item': ListItem,
      'mwc-list': List,
    };
  }
}
