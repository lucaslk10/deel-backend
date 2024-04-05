import { Service } from 'typedi';
import { Contract, Job as JobModel, Profile } from '@/models';
import { JobInterface } from '@/interfaces/job.interface';
import { Op } from 'sequelize';
import { DB } from '@/database';

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

  public async payForJob(jobId: number, clientId: number) {
    const transaction = await DB.sequelize.transaction();

    try {
      const job = await JobModel.findOne({ transaction, where: { id: jobId } });
      if (!job) throw new Error('Job not found');

      // make sure to find just contracts of the authenticated user (client)
      const contract = await Contract.findOne({ transaction, where: { id: job.ContractId, ClientId: clientId } });
      if (!contract) throw new Error('Contract not found');

      // then check if job is paid
      if (job.paid) throw new Error('Job is already paid');

      const client = await Profile.findOne({ transaction, where: { id: clientId } });
      if (!client) throw new Error('Client not found');

      // check the client type
      if (client.type !== 'client') throw new Error('Only clients can make payments');

      // check contractor exists
      const contractor = await Profile.findOne({ transaction, where: { id: contract.ContractorId } });
      if (!contractor) throw new Error('Contractor not found');

      if (client.balance < job.price) throw new Error('Insufficient balance');

      // Updating balances
      client.balance -= job.price;
      contractor.balance += job.price;

      // Round numbers to 2 decimal
      client.balance = Number(Number(client.balance).toFixed(2));
      contractor.balance = Number(Number(contractor.balance).toFixed(2));

      await client.save({ transaction });
      await contractor.save({ transaction });

      // Mark job as paid
      job.paid = true;
      job.paymentDate = new Date().toISOString();
      await job.save({ transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error; // Rethrow the error after rollback to be handled by the caller
    }
  }
}
