import { Lenses } from '@compository/lib';
import { AppWebsocket, CellId } from '@holochain/conductor-api';
import { TransactionList } from './elements/transaction-list';
import { CreateOffer } from './elements/create-offer';
import { Constructor } from 'lit-element';
//@ts-ignore
import { createUniqueTag } from '@open-wc/scoped-elements/src/createUniqueTag';
import { TransactorStore } from './transactor.store';
import { PublicTransactorService } from './public-transactor.service';
import { connect } from './elements/utils/base-element';
import { MyOffers } from './elements/my-offers';

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
  const service = new PublicTransactorService(appWebsocket, cellId);
  const store = new TransactorStore(service);

  return {
    standalone: [
      {
        name: 'My Offers',
        render(root: ShadowRoot) {
          renderUnique('my-offers', connect(MyOffers, store), root);
        },
      },
      {
        name: 'Transaction History',
        render(root: ShadowRoot) {
          renderUnique(
            'my-transaction-history',
            connect(TransactionList, store),
            root
          );
        },
      },
      {
        name: 'Create Offer',
        render(root: ShadowRoot) {
          renderUnique('create-offer', connect(CreateOffer, store), root);
        },
      },
    ],
    entryLenses: {},
    attachmentsLenses: [],
  };
}
