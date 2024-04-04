// JobService.test.ts

import { Job as JobModel } from '@/models';
import { JobService } from '@/services/jobs.service';
import { Op } from 'sequelize';

jest.mock('@/models', () => ({
  Job: {
    findAll: jest.fn(),
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
});
