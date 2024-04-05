import { DB } from '@/database';
import { Job, Profile } from '@/models';
import { BalanceService } from '@/services/balance.service';

jest.mock('@/models', () => ({
  Profile: {
    findOne: jest.fn(),
  },
  Job: {
    findAll: jest.fn(),
  },
  Contract: {},
}));

const mockTransaction = { commit: jest.fn(), rollback: jest.fn() };
jest.mock('@/database', () => ({
  DB: {
    sequelize: {
      transaction: jest.fn(() => mockTransaction),
    },
    Sequelize: {
      fn: jest.fn(),
      col: jest.fn(),
    },
  },
}));

describe('BalanceService', () => {
  let balanceService: BalanceService;

  beforeEach(() => {
    jest.clearAllMocks();
    balanceService = new BalanceService();
  });

  it('successfully deposits to user within limit', async () => {
    const userId = '1';
    const amount = 100;
    const mockClient = { balance: 500, save: jest.fn() };
    const mockUnpaidTotal = { totalUnpaidPrice: '1000' }; // $1000 of unpaid jobs

    (Profile.findOne as jest.Mock).mockResolvedValue(mockClient);
    (Job.findAll as jest.Mock).mockResolvedValue([mockUnpaidTotal]);

    await balanceService.depositToUser(amount, userId);

    expect(Profile.findOne).toHaveBeenCalledWith({
      transaction: mockTransaction,
      where: { id: userId },
    });
    expect(Job.findAll).toHaveBeenCalled();
    expect(mockClient.balance).toBe(600); // Initial 500 + 100 deposit
    expect(mockClient.save).toHaveBeenCalledWith({ transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('throws an error if client not found', async () => {
    const userId = '2';
    const amount = 50;

    (Profile.findOne as jest.Mock).mockResolvedValue(null);

    await expect(balanceService.depositToUser(amount, userId)).rejects.toThrow('Client not found');
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('rejects deposit exceeding 25% of unpaid jobs total', async () => {
    const userId = '3';
    const amount = 300; // Attempting to deposit $300
    const mockClient = { balance: 500, save: jest.fn() };
    const mockUnpaidTotal = { totalUnpaidPrice: '800' }; // $800 of unpaid jobs, 25% limit = $200

    (Profile.findOne as jest.Mock).mockResolvedValue(mockClient);
    (Job.findAll as jest.Mock).mockResolvedValue([mockUnpaidTotal]);

    await expect(balanceService.depositToUser(amount, userId)).rejects.toThrow(
      'Deposit amount exceeds the 25% limit of unpaid jobs total. Max allowed: 200',
    );
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('handles case where no unpaid jobs exist', async () => {
    const userId = 'user-no-unpaid';
    const amount = 50; // Attempting to deposit $50
    const mockClient = { id: userId, balance: 400, save: jest.fn() };

    (Profile.findOne as jest.Mock).mockResolvedValue(mockClient);
    // Simulate no unpaid jobs found
    (Job.findAll as jest.Mock).mockResolvedValue([]);

    await balanceService.depositToUser(amount, userId);

    // Expect the deposit to proceed as the limit calculation would default to 0
    expect(mockClient.save).toHaveBeenCalledWith({ transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
  });

  it('rolls back transaction on client.save failure', async () => {
    const userId = 'user-save-fail';
    const amount = 100;
    const mockClient = {
      id: userId,
      balance: 600,
      save: jest.fn().mockRejectedValue(new Error('Database save error')),
    };

    (Profile.findOne as jest.Mock).mockResolvedValue(mockClient);
    // Assume sufficient unpaid job total for the deposit to be within the limit
    (Job.findAll as jest.Mock).mockResolvedValue([{ totalUnpaidPrice: '1000' }]);

    await expect(balanceService.depositToUser(amount, userId)).rejects.toThrow('Database save error');
    expect(mockTransaction.rollback).toHaveBeenCalled();
  });

  it('processes deposit correctly when totalUnpaidPrice is undefined', async () => {
    const userId = 'user-undefined-total';
    const amount = 50;
    const mockClient = { id: userId, balance: 500, save: jest.fn() };

    (Profile.findOne as jest.Mock).mockResolvedValue(mockClient);
    (Job.findAll as jest.Mock).mockResolvedValue([{ totalUnpaidPrice: undefined }]);

    await balanceService.depositToUser(amount, userId);

    // Expect the deposit to proceed as the calculation defaults to 0 for undefined totalUnpaidPrice
    expect(mockClient.balance).toBe(550); // Initial 500 + 50 deposit
    expect(mockClient.save).toHaveBeenCalledWith({ transaction: mockTransaction });
    expect(mockTransaction.commit).toHaveBeenCalled();
  });
});
