import { LitElement, html, query, property } from 'lit-element';
import { ApolloClient, gql } from '@apollo/client/core';

import { Agent } from 'holochain-profiles-username';
import '@material/mwc-circular-progress';
import '@material/mwc-list';
import '@material/mwc-list/mwc-list-item';

import { sharedStyles } from '../sharedStyles';
import { LlmPubCreateOffer } from './llm-pub-create-offer';

export abstract class LlmPubAgentList extends LitElement {
  /** Public attributes */

  /** Dependencies */
  abstract _apolloClient: ApolloClient<any>;

  /** Private properties */

  @query('#create-offer-dialog')
  _createOfferDialog!: LlmPubCreateOffer;

  @property({ type: Object })
  _selectedRecipient: Agent | undefined = undefined;

  @property({ type: Array })
  _agents: Agent[] | undefined = undefined;

  static styles = sharedStyles;

  async firstUpdated() {
    const agents = await this._apolloClient.query({
      query: gql`
        {
          me {
            id
          }
          allAgents {
            id
            username
          }
        }
      `,
    });

    this._agents = agents.data.allAgents.filter(
      (a: Agent) => a.id !== agents.data.me.id
    );
  }

  renderCreateOffer() {
    return html`
      <llm-pub-create-offer
        id="create-offer-dialog"
        .creditor=${this._selectedRecipient}
        @offer-created=${() => (this._createOfferDialog.open = false)}
      >
      </llm-pub-create-offer>
    `;
  }

  renderAgent(agent: Agent) {
    return html`
      <div class="row" style="align-items: center;">
        <mwc-list-item style="flex: 1;" twoline noninteractive graphic="avatar">
          <span>@${agent.username}</span>
          <span slot="secondary">${agent.id}</span>
          <mwc-icon slot="graphic">person</mwc-icon>
        </mwc-list-item>

        <mwc-button
          label="Offer credits"
          style="padding-right: 16px;"
          outlined
          @click=${() => {
            this._selectedRecipient = agent;
            this._createOfferDialog.open = true;
          }}
        >
          <mwc-icon style="padding-top: 3px;" slot="trailingIcon"
            >send</mwc-icon
          >
        </mwc-button>
      </div>
    `;
  }

  render() {
    return html`<div class="column center-content">
      ${this.renderContent()}
    </div>`;
  }

  renderContent() {
    if (!this._agents)
      return html`<div class="padding center-content">
        <mwc-circular-progress></mwc-circular-progress>
      </div>`;

    if (this._agents.length === 0)
      return html`<div class="padding">
        <span>There are no agents to which to offer credits</span>
      </div>`;

    return html`
      ${this.renderCreateOffer()}
      <mwc-list style="width: 100%;">
        ${this._agents.map(
          (agent, i) => html`${this.renderAgent(agent)}
          ${this._agents && i < this._agents.length - 1
            ? html`<li divider padded role="separator"></li> `
            : html``} `
        )}
      </mwc-list>
    `;
  }
}
