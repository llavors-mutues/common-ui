import { gql } from '@apollo/client/core';

export const mutualCreditTypeDefs = gql`
  scalar Date

  enum OfferState {
    Pending
    Canceled
    Approved
    Completed
  }

  type Transaction {
    id: ID!

    spender: Agent!
    recipient: Agent!
    
    amount: Float!
    timestamp: Date!
  }

  type Offer {
    id: ID!
    
    state: OfferState!

    spender: Agent!
    recipient: Agent!
    amount: Float!
  }

  extend type Query {
    myTransactions: [Transaction!]!
    
    myPendingOffers: [Offer!]!
    allMyOffers: [Offer!]!

    myBalance: Float!
  }

  extend type Mutation {
    createOffer(recipientId: ID!, amount: Float!): Offer!
    cancelOffer(offerId: ID!): ID!
    acceptOffer(offerId: ID!): Transaction!
  }
`;
