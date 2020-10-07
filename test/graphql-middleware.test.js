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
import { HodCalendarEvent } from '../dist/elements/hod-calendar-event';

function createIframe() {
  const iframe = document.createElement('iframe');
  document.body.appendChild(iframe);
  const nestedWindow = iframe.contentWindow;

  return {
    window: nestedWindow,
  };
}

describe('Apollo middleware', () => {
  it('initial state is empty', async () => {
    const { client } = await setupApolloClient();

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

  it('create an offer and accept it', async () => {
    const {
      client: aliceClient,
      agentAddress: aliceAddress,
    } = await setupApolloClient();
    const {
      client: bobClient,
      agentAddress: bobAddress,
    } = await setupApolloClient();

    await aliceClient.mutate({
      mutation: CREATE_OFFER,
      variables: {
        recipientId: bobAddress,
        amount: 10.0,
      },
    });

    const getMyOffers = await bobClient.query({
      query: GET_MY_PENDING_OFFERS,
    });
    expect(getMyOffers.data.myPendingOffers.length).to.equal(1);
  });
});
