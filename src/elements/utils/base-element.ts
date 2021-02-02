import { Constructor, LitElement } from 'lit-element';
import { ScopedElementsMixin as Scoped } from '@open-wc/scoped-elements';
import { TransactorStore } from '../../transactor.store';
import { MobxReactionUpdate } from '@adobe/lit-mobx';
import { Dictionary } from '@compository/lib';

export abstract class BaseElement extends MobxReactionUpdate(
  Scoped(LitElement)
) {
  connectedCallback() {
    super.connectedCallback();
    for (const [tag, el] of Object.entries(this.getScopedElements())) {
      this.defineScopedElement(tag, el);
    }
  }

  abstract get transactorStore(): TransactorStore;

  getScopedElements(): Dictionary<Constructor<HTMLElement>> {
    return {};
  }
}

export function connect<T extends typeof BaseElement>(
  baseClass: T,
  store: TransactorStore
): Constructor<HTMLElement> {
  return class extends (baseClass as unknown as typeof HTMLElement) {
    get transactorStore(): TransactorStore {
      return store;
    }
  };
}
