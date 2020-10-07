import { ApolloClient } from '@apollo/client/core';
import { HodCalendarEvent } from './elements/hod-calendar-event';
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
      'hod-calendar-event',
      setupApolloClientElement(HodCalendarEvent, this.dependencies.apolloClient)
    );
  }

  static isInstalled(): boolean {
    return customElements.get('hod-calendar-event');
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
