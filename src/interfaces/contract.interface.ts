export interface ContractInterface {
  id?: number;
  terms: string;
  status: 'new' | 'in_progress' | 'terminated';
  ContractorId?: number;
  ClientId?: number;
}
