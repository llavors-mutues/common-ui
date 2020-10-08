import { gql } from '@apollo/client/core';

export const mutualCreditTypeDefs = gql`
  scalar Date

  enum OfferState {
    Pending
    Canceled
    Rejected
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

  extend type Agent {
    transactions: [Transaction!]!
    balance: Float!
  }

  extend type Query {
    myPendingOffers: [Offer!]!
    allMyOffers: [Offer!]!
    offer(offerId: ID!): Offer!
  }

  extend type Mutation {
    createOffer(recipientId: ID!, amount: Float!): Offer!
    rejectOffer(offerId: ID!): ID!
    cancelOffer(offerId: ID!): ID!
    acceptOffer(offerId: ID!): Transaction!
  }
`;
