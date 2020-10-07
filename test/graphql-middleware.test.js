import { gql } from '@apollo/client/core';
import { expect } from '@open-wc/testing';

import { setupApolloClient } from './mocks/setupApolloClient';
import {
  ACCEPT_OFFER,
  CANCEL_OFFER,
  CREATE_OFFER,
  GET_MY_BALANCE,
  GET_MY_TRANSACTIONS,
  GET_MY_PENDING_OFFERS,
} from '../dist';

describe('Apollo middleware', () => {
  it('initial state is empty', async () => {
    const client = await setupApolloClient();

    const getMyBalance = await client.query({
      query: GET_MY_BALANCE,
    });
    expect(getMyBalance.data.myBalance).to.equal(0);

    const getMyTransactions = await client.query({
      query: GET_MY_TRANSACTIONS,
    });
    expect(getMyTransactions.data.myTransactions.length).to.equal(0);

    const getMyOffers = await client.query({
      query: GET_MY_PENDING_OFFERS,
    });
    expect(getMyOffers.data.myPendingOffers.length).to.equal(0);
  });

  it('create and offer and accept it', async () => {
    const client = await setupApolloClient();

    

  });
});
