import { Lenses } from '@compository/lib';
import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { TransactionList } from './elements/transaction-list';
import { CreateOffer } from './elements/create-offer';
import { Constructor } from 'lit-element';
//@ts-ignore
import { createUniqueTag } from '@open-wc/scoped-elements/src/createUniqueTag';
import { TransactorStore } from './transactor.store';
import { PublicTransactorService } from './public-transactor.service';
import { MyOffers } from './elements/my-offers';
import { ProfilesService } from '@holochain-open-dev/profiles';
import { ProfilesStore } from '@holochain-open-dev/profiles/profiles.store';
import { connectStore } from '@holochain-open-dev/common';
import { MyBalance } from './elements/my-balance';

function renderUnique(
  tag: string,
  baseClass: Constructor<HTMLElement>,
  root: ShadowRoot
) {
  const registry = customElements;
  const uniqueTag = createUniqueTag(tag, registry);
  root.innerHTML = `
        <link
          href="https://fonts.googleapis.com/icon?family=Material+Icons"
          rel="stylesheet"
        />
          <${uniqueTag}></${uniqueTag}>
        `;

  registry.define(
    uniqueTag,
    (class extends baseClass {} as unknown) as Constructor<HTMLElement>
  );
}

export default function lenses(
  appWebsocket: AppWebsocket,
  cellId: CellId
): Lenses {
  const profilesService = new ProfilesService(appWebsocket, cellId);
  const profilesStore = new ProfilesStore(profilesService);

  const service = new PublicTransactorService(appWebsocket, cellId);
  const store = new TransactorStore(service, profilesStore);

  const signalReceiver = AppWebsocket.connect(
    appWebsocket.client.socket.url,
    12000,
    signal => {
      const payload = signal.data.payload;
      if (payload.OfferReceived) {
        store.storeOffer(payload.OfferReceived);
      } else if (payload.OfferAccepted) {
        store.storeTransaction(payload.OfferAccepted);
      }
    }
  );

  return {
    standalone: [
      {
        name: 'My Offers',
        render(root: ShadowRoot) {
          renderUnique('my-offers', connectStore(MyOffers, store), root);
        },
      },
      {
        name: 'My Balance',
        render(root: ShadowRoot) {
          renderUnique(
            'my-balance',
            connectStore(MyBalance, store),
            root
          );
        },
      },
      {
        name: 'Create Offer',
        render(root: ShadowRoot) {
          renderUnique(
            'create-offer',
            connectStore(CreateOffer, store),
            root
          );
        },
      },
    ],
    entryLenses: {},
    attachmentsLenses: [],
  };
}
