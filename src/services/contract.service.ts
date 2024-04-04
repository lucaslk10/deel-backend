import { Service } from 'typedi';
import { ContractInterface as Contract } from '@/interfaces/contract.interface';
import { Contract as ContractModel } from '@/models';

@Service()
export class ContractService {
  public async findContractById(contractId: number, profileId: number): Promise<Contract> {
    const findContract: Contract = await ContractModel.findOne({ where: { id: contractId, ClientId: profileId } });
    return findContract;
  }
}
