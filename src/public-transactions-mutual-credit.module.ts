import { ApolloClient } from '@apollo/client/core';
import { LlmPubAgentList } from './elements/llm-pub-agent-list';
import { LlmPubCreateOffer } from './elements/llm-pub-create-offer';
import { LlmPubOfferDetail } from './elements/llm-pub-offer-detail';
import { LlmPubPendingOfferList } from './elements/llm-pub-pending-offer-list';
import { LlmPubTransactionList } from './elements/llm-pub-transaction-list';
import { mutualCreditTypeDefs } from './graphql/schema';
import { setupApolloClientElement } from './utils';

export interface PublicTransactionsMutualCreditModuleDependencies {
  apolloClient: ApolloClient<any>;
}

export class PublicTransactionsMutualCreditModule {
  constructor(
    protected dependencies: PublicTransactionsMutualCreditModuleDependencies
  ) {
    this.checkApolloClientTypeDefs(dependencies.apolloClient);
  }

  /** Public methods */

  install() {
    customElements.define(
      'llm-pub-agent-list',
      setupApolloClientElement(LlmPubAgentList, this.dependencies.apolloClient)
    );
    customElements.define(
      'llm-pub-create-offer',
      setupApolloClientElement(
        LlmPubCreateOffer,
        this.dependencies.apolloClient
      )
    );
    customElements.define(
      'llm-pub-offer-detail',
      setupApolloClientElement(
        LlmPubOfferDetail,
        this.dependencies.apolloClient
      )
    );
    customElements.define(
      'llm-pub-pending-offer-list',
      setupApolloClientElement(
        LlmPubPendingOfferList,
        this.dependencies.apolloClient
      )
    );
    customElements.define(
      'llm-pub-transaction-list',
      setupApolloClientElement(
        LlmPubTransactionList,
        this.dependencies.apolloClient
      )
    );
  }

  static isInstalled(): boolean {
    return customElements.get('llm-pub-agent-list');
  }

  /** Private helpers */
  private checkApolloClientTypeDefs(apolloClient: ApolloClient<any>): void {
    if (
      !Array.isArray(apolloClient.typeDefs) ||
      !apolloClient.typeDefs.includes(mutualCreditTypeDefs as any)
    )
      throw new Error(
        'Error initializing Module: ApolloClient must be initialized using an array of typeDefs containing the mutualCreditTypeDefs'
      );
  }
}
