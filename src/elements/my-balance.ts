import { html } from 'lit-html';
import { Card } from 'scoped-material-components/mwc-card';
import { TransactionList } from './transaction-list';
import { BaseElement, connectTransactor } from './utils/base-element';
import { sharedStyles } from './utils/shared-styles';

export abstract class MyBalance extends BaseElement {
  render() {
    const balance = Math.round(this.transactorStore.myBalance * 100) / 100;
    return html`
      <div class="column center-content" style="flex: 1;">
        <span style="font-size: 24px; margin: 16px;">
          ${balance > 0 ? '+' : ''}${balance} credits
        </span>
        <mwc-card style="width: auto; flex: 1;">
          <transaction-list></transaction-list>
        </mwc-card>
      </div>
    `;
  }

  static get styles() {
    return sharedStyles;
  }

  getScopedElements() {
    return {
      'transaction-list': connectTransactor(
        TransactionList,
        this.transactorStore
      ),
      'mwc-card': Card,
    };
  }
}
