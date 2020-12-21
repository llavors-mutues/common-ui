export interface Transaction {
  spender_pub_key: string;
  recipient_pub_key: string;
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

  spender_pub_key: string;
  recipient_pub_key: string;
  amount: number;

  state: OfferState;
}
