import { gql } from '@apollo/client/core';

export const GET_MY_BALANCE = gql`
  query GetMyBalance {
    me {
      id
      balance
    }
  }
`;

export const GET_MY_TRANSACTIONS = gql`
  query GetMyTransactions {
    me {
      id
      transactions {
        id
        spender {
          id
          username
        }
        recipient {
          id
          username
        }
        amount
        timestamp
      }
    }
  }
`;

export const GET_MY_PENDING_OFFERS = gql`
  query GetPendingOffers {
    myPendingOffers {
      id

      spender {
        id
        username
      }
      recipient {
        id
        username
      }
      amount

      state
    }
  }
`;

export const GET_OFFER_DETAIL = gql`
  query GetOfferDetail($offerId: ID!) {
    offer(offerId: $offerId) {
      id

      spender {
        id
        username
        balance
      }
      recipient {
        id
        username
        balance
      }
      amount

      state
    }
  }
`;

export const CREATE_OFFER = gql`
  mutation CreateOffer($recipientId: ID!, $amount: Float!) {
    createOffer(recipientId: $recipientId, amount: $amount) {
      id

      spender {
        id
        username
      }
      recipient {
        id
        username
      }
      amount

      state
    }
  }
`;

export const ACCEPT_OFFER = gql`
  mutation AcceptOffer($offerId: ID!) {
    acceptOffer(offerId: $offerId) {
      id

      spender {
        id
        username
      }
      recipient {
        id
        username
      }
      amount

      timestamp
    }
  }
`;

export const CANCEL_OFFER = gql`
  mutation CancelOffer($offerId: ID!) {
    cancelOffer(offerId: $offerId)
  }
`;

export const REJECT_OFFER = gql`
  mutation RejectOffer($offerId: ID!) {
    rejectOffer(offerId: $offerId)
  }
`;
