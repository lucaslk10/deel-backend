// JobService.test.ts

import { Job as JobModel, Contract as ContractModel, Profile as ProfileModel } from '@/models';
import { JobService } from '@/services/jobs.service';
import { Op } from 'sequelize';
import { DB } from '@/database';
jest.mock('@/models', () => ({
  Job: {
    findOne: jest.fn(),
    findAll: jest.fn(),
  },
  Contract: {
    findOne: jest.fn(),
  },
  Profile: {
    findOne: jest.fn(),
  },
}));

// Mock the DB transaction
const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
jest.mock('@/database', () => ({
  DB: {
    sequelize: {
      transaction: jest.fn(() => mockTransaction),
    },
  },
}));

describe('JobService', () => {
  let jobService: JobService;

  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();

    // Initialize JobService before each test
    jobService = new JobService();
  });

  describe('getUnpaidJobs', () => {
    it('should return unpaid jobs', async () => {
      const mockJobs = [
        { id: 1, description: 'Job 1', paid: false },
        { id: 2, description: 'Job 2', paid: false },
      ];

      // Mock the findAll method of JobModel to return mock jobs
      (JobModel.findAll as jest.Mock).mockResolvedValue(mockJobs);

      const result = await jobService.getUnpaidJobs();

      expect(JobModel.findAll).toHaveBeenCalledWith({
        where: {
          paid: {
            [Op.ne]: 1,
          },
        },
      });
      expect(result).toEqual(mockJobs);
    });

    it('should handle and return an empty array when no unpaid jobs are found', async () => {
      // Mock the findAll method to return an empty array
      (JobModel.findAll as jest.Mock).mockResolvedValue([]);

      const result = await jobService.getUnpaidJobs();

      expect(JobModel.findAll).toHaveBeenCalledWith({
        where: {
          paid: {
            [Op.ne]: 1,
          },
        },
      });
      expect(result).toEqual([]);
    });
  });

  describe('payForJob', () => {
    it('successfully pays for a job', async () => {
      // Setup mocks for the happy path
      (JobModel.findOne as jest.Mock).mockResolvedValue({ id: 1, ContractId: 1, paid: false, price: 100, save: jest.fn() });
      (ContractModel.findOne as jest.Mock).mockResolvedValue({ id: 1, ClientId: 1, ContractorId: 2, save: jest.fn() });
      (ProfileModel.findOne as jest.Mock)
        .mockResolvedValueOnce({ id: 1, balance: 200, type: 'client', save: jest.fn() }) // First call for client
        .mockResolvedValueOnce({ id: 2, balance: 100, save: jest.fn() }); // Second call for contractor

      // Act
      await jobService.payForJob(1, 1);

      // Asserts
      expect(JobModel.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1 } }));
      expect(ContractModel.findOne).toHaveBeenCalledWith(expect.objectContaining({ where: { id: 1, ClientId: 1 } }));
      expect(ProfileModel.findOne).toHaveBeenCalledTimes(2);
      expect(DB.sequelize.transaction).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('throws error if job not found', async () => {
      // Setup mock to return null for job not found
      (JobModel.findOne as jest.Mock).mockResolvedValue(null);

      await expect(jobService.payForJob(1, 1)).rejects.toThrow('Job not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('throws an error if contract not found', async () => {
      (JobModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ContractId: 1,
        paid: false,
        price: 100,
        save: jest.fn(),
      });
      (ContractModel.findOne as jest.Mock).mockResolvedValue(null); // Contract not found

      await expect(jobService.payForJob(1, 1)).rejects.toThrow('Contract not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('throws an error if client not found', async () => {
      (JobModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ContractId: 1,
        paid: false,
        price: 100,
        save: jest.fn(),
      });
      (ContractModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ClientId: 1,
        ContractorId: 2,
        save: jest.fn(),
      });
      (ProfileModel.findOne as jest.Mock).mockResolvedValueOnce(null); // Client not found

      await expect(jobService.payForJob(1, 1)).rejects.toThrow('Client not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('throws an error if contractor not found', async () => {
      (JobModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ContractId: 1,
        paid: false,
        price: 100,
        save: jest.fn(),
      });
      (ContractModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ClientId: 1,
        ContractorId: 2,
        save: jest.fn(),
      });
      (ProfileModel.findOne as jest.Mock)
        .mockResolvedValueOnce({ id: 1, balance: 200, type: 'client', save: jest.fn() }) // Client found
        .mockResolvedValueOnce(null); // Contractor not found

      await expect(jobService.payForJob(1, 1)).rejects.toThrow('Contractor not found');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('throws an error if job is already paid', async () => {
      (JobModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ContractId: 1,
        paid: true,
        price: 100,
        save: jest.fn(),
      });

      await expect(jobService.payForJob(1, 1)).rejects.toThrow('Job is already paid');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('throws an error if client balance is insufficient', async () => {
      (JobModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ContractId: 1,
        paid: false,
        price: 300,
        save: jest.fn(),
      });
      (ContractModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ClientId: 1,
        ContractorId: 2,
        save: jest.fn(),
      });
      (ProfileModel.findOne as jest.Mock)
        .mockResolvedValueOnce({
          id: 1,
          balance: 200,
          type: 'client',
          save: jest.fn(),
        })
        .mockResolvedValueOnce({
          id: 1,
          balance: 200,
          type: 'client',
          save: jest.fn(),
        });

      await expect(jobService.payForJob(1, 1)).rejects.toThrow('Insufficient balance');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });

    it('throws an error if the client type is incorrect', async () => {
      (JobModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ContractId: 1,
        paid: false,
        price: 100,
        save: jest.fn(),
      });
      (ContractModel.findOne as jest.Mock).mockResolvedValue({
        id: 1,
        ClientId: 1,
        ContractorId: 2,
        save: jest.fn(),
      });
      (ProfileModel.findOne as jest.Mock).mockResolvedValueOnce({
        id: 1,
        balance: 200,
        type: 'contractor',
        save: jest.fn(),
      }); // Incorrect client type

      await expect(jobService.payForJob(1, 1)).rejects.toThrow('Only clients can make payments');
      expect(mockTransaction.rollback).toHaveBeenCalled();
    });
  });
});
