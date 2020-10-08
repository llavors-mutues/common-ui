import type { Agent } from 'holochain-profiles-username';

export interface AgentWithBalance extends Agent {
  balance: number;
}

export interface Transaction {
  id: string;

  spender: Agent;
  recipient: Agent;
  amount: number;
  timestamp: number;
}

export type OfferState =
  | 'Pending'
  | 'Canceled'
  | 'Rejected'
  | 'Completed'
  | 'Approved';
export interface Offer {
  id: string;

  spender: Agent;
  recipient: Agent;
  amount: number;

  state: OfferState;
}

export interface OfferDetail {
  id: string;

  spender: AgentWithBalance;
  recipient: AgentWithBalance;
  amount: number;

  state: OfferState;
}
