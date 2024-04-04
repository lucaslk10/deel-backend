export interface JobInterface {
  id?: number;
  description: string;
  price: number;
  paid: boolean;
  paymentDate: any;
  ContractId?: number;
}
