import { Service } from 'typedi';
import { DB } from '@database';
import { HttpException } from '@/exceptions/httpException';
import { Contract } from '@/interfaces/contract.interface';
import { Contract as ContractModel } from '@/models';

@Service()
export class ContractService {
  public async findContractById(contractId: number): Promise<Contract> {
    const findContract: Contract = await ContractModel.findOne({ where: { id: contractId } });
    if (!findContract) throw new HttpException(409, "Contract doesn't exist");
    return findContract;
  }
}
