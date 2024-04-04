import { ContractService } from '@/services/contract.service';
import { Contract as ContractModel } from '../../models';

jest.mock('@/models', () => ({
  Contract: {
    findOne: jest.fn(),
  },
}));

describe('ContractService', () => {
  let contractService: ContractService;

  beforeEach(() => {
    jest.clearAllMocks();
    contractService = new ContractService();
  });

  describe('findContractById', () => {
    it('should find a contract by ID', async () => {
      const contractId = 1;
      const profileId = 1;
      const mockContract = { id: contractId, ClientId: profileId }; // Mock response

      // Mock the implementation of findOne to return the mock contract
      (ContractModel.findOne as jest.Mock).mockResolvedValue(mockContract);

      const result = await contractService.findContractById(contractId, profileId);

      expect(ContractModel.findOne).toHaveBeenCalledWith({
        where: { id: contractId, ClientId: profileId },
      });
      expect(result).toEqual(mockContract);
    });
  });
});
