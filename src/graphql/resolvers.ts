import { Resolvers } from '@apollo/client/core';
import { AppWebsocket, CellId } from '@holochain/conductor-api';

function secondsToTimestamp(secs: number) {
  return [secs, 0];
}

function hashToString(hash: { hash: Buffer; hash_type: Buffer }) {
  return hash.hash_type.toString('hex') + hash.hash.toString('hex');
}

// TODO: define your own resolvers

export function commonMutualCreditResolvers(
  appWebsocket: AppWebsocket,
  cellId: CellId,
  zomeName = 'transactor'
): Resolvers {
  function callZome(fn_name: string, payload: any) {
    return appWebsocket.callZome({
      cap: null as any,
      cell_id: cellId,
      zome_name: zomeName,
      fn_name,
      payload,
      provenance: cellId[1],
    });
  }

  return {
    Transaction: {
      spender(parent) {
        return { id: parent.spender_pub_key };
      },
      recipient(parent) {
        return { id: parent.recipient_pub_key };
      },
    },
    Query: {
      async myTransactions(_, __) {
        const transactions = await callZome('query_my_transactions', null);
        return transactions.map((t: any) => ({ id: t[0], ...t[1] }));
      },
      async myPendingOffers(_, __) {
        const offers = await callZome('query_my_pending_offers', null);

        return offers.map((offer: any) => ({ id: offer[0], ...offer[1] }));
      },
      async myBalance(_, __) {
        return callZome('query_my_balance', null);
      },
    },
    Mutation: {
      async createOffer(_, { recipientId, amount }) {
        return callZome('create_offer', {
          recipient_pub_key: recipientId,
          amount,
        });
      },
      async acceptOffer(_, { offerId }) {
        return callZome('accept_offer', {
          offer_hash: offerId,
        });
      },
      async cancelOffer(_, { offerId }) {
        await callZome('cancel_offer', {
          offer_hash: offerId,
        });

        return offerId;
      },
    },
  };
}
