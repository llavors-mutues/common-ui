import { Resolvers } from '@apollo/client/core';
import { AppWebsocket, CellId } from '@holochain/conductor-api';

function secondsToTimestamp(secs: number) {
  return [secs, 0];
}

function hashToString(hash: { hash: Buffer; hash_type: Buffer }) {
  return hash.hash_type.toString('hex') + hash.hash.toString('hex');
}

// TODO: define your own resolvers

export function mutualCreditResolvers(
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
    Offer: {
      spender(parent) {
        return { id: parent.spender_pub_key };
      },
      recipient(parent) {
        return { id: parent.recipient_pub_key };
      },
    },
    Agent: {
      async balance(parent) {
        return callZome('get_balance_for_agent', { agent_pub_key: parent.id });
      },
      async transactions(parent) {
        const transactions = await callZome('get_transactions_for_agent', {
          agent_pub_key: parent.id,
        });
        return transactions.map((t: any) => ({ id: t[0], ...t[1] }));
      },
    },
    Query: {
      async myPendingOffers() {
        const offers = await callZome('query_my_pending_offers', null);

        return offers.map((offer: any) => ({ id: offer[0], ...offer[1] }));
      },
      async allMyOffers() {
        const offers = await callZome('query_all_my_offers', null);

        return offers.map((offer: any) => ({ id: offer[0], ...offer[1] }));
      },
    },
    Mutation: {
      async createOffer(_, { recipientId, amount }) {
        const offer = await callZome('create_offer', {
          recipient_pub_key: recipientId,
          amount,
        });

        return {
          id: offer[0],
          ...offer[1],
        };
      },
      async acceptOffer(_, { offerId }) {
        const transaction = await callZome('accept_offer', {
          offer_hash: offerId,
        });

        return {
          id: transaction[0],
          ...transaction[1],
        };
      },
      async cancelOffer(_, { offerId }) {
        await callZome('cancel_offer', {
          offer_hash: offerId,
        });

        return offerId;
      },
      async rejectOffer(_, { offerId }) {
        await callZome('reject_offer', {
          offer_hash: offerId,
        });

        return offerId;
      },
    },
  };
}
