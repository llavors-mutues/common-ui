import { Constructor, LitElement } from 'lit-element';
import { PublicTransactorService } from '../public-transactor.service';
import { ScopedElementsMixin as Scoped } from '@open-wc/scoped-elements';
import { membraneContext } from '@holochain-open-dev/membrane-context';
import { AppWebsocket, CellId } from '@holochain/conductor-api';

export class BaseElement extends membraneContext(
  Scoped(LitElement) as Constructor<LitElement>
) {
  get _transactorService(): PublicTransactorService {
    return new PublicTransactorService(
      this.membraneContext.appWebsocket as AppWebsocket,
      this.membraneContext.cellId as CellId
    );
  }
}
