import { Service } from 'typedi';
import { ContractInterface as Contract } from '@/interfaces/contract.interface';
import { Contract as ContractModel } from '@/models';
import { Op } from 'sequelize';

@Service()
export class ContractService {
  public async findContractById(contractId: number, profileId: number): Promise<Contract> {
    const findContract: Contract = await ContractModel.findOne({ where: { id: contractId, ClientId: profileId } });
    return findContract;
  }

  // Returns a list of contracts belonging to a user (client or contractor), the list should only contain non terminated contracts.
  // question: It should list only for the authenticated user (profile_id)?
  public async listNonTerminatedContracts(): Promise<Contract[]> {
    const where = {
      status: {
        [Op.ne]: 'terminated',
      },
    };

    // in case of necessary just list contracts from authenticated user, we can use this snippet of code:
    // also make sure to receive profileType from "req", as we can leverage the first call to db when checking if user exists for auth
    // if (profileType === 'contractor') where.ContractorId = profileType;
    // else where.ClientId = profileType;

    const nonTerminatedContracts: Contract[] = await ContractModel.findAll({
      where,
    });
    return nonTerminatedContracts;
  }
}
