import { Service } from 'typedi';
import { Job as JobModel } from '@/models';
import { JobInterface } from '@/interfaces/job.interface';
import { Op } from 'sequelize';

@Service()
export class JobService {
  public async getUnpaidJobs(): Promise<JobInterface[]> {
    const where = {
      paid: {
        [Op.ne]: 1,
      },
    };

    const jobs: JobInterface[] = await JobModel.findAll({ where });
    return jobs;
  }
}
