import { Service } from 'typedi';
import { Contract, Job as JobModel, Profile } from '@/models';
import { DB } from '@/database';

@Service()
export class BalanceService {
  public async depositToUser(amount: number, userId: string) {
    const transaction = await DB.sequelize.transaction();

    try {
      // Fetch the user (client)
      const client = await Profile.findOne({ transaction, where: { id: userId } });
      if (!client) {
        throw new Error('Client not found');
      }

      const [unpaidResult] = ((await JobModel.findAll({
        attributes: [[DB.Sequelize.fn('SUM', DB.Sequelize.col('price')), 'totalUnpaidPrice']],
        include: [
          {
            model: Contract,
            attributes: [],
            where: { ClientId: userId },
          },
        ],
        where: { paid: 0 },
        raw: true,
      })) || []) as any;

      const totalUnpaid = unpaidResult?.totalUnpaidPrice;
      const totalUnpaidPrice = totalUnpaid ? parseFloat(totalUnpaid) : 0;
      const depositLimit = totalUnpaidPrice * 0.25; // 25% of the total unpaid jobs cost

      if (totalUnpaidPrice && amount > depositLimit) {
        throw new Error(`Deposit amount exceeds the 25% limit of unpaid jobs total. Max allowed: ${depositLimit}`);
      }

      // If the amount is within the limit, proceed to update the client's balance
      client.balance += amount;
      await client.save({ transaction });

      // // Commit the transaction
      await transaction.commit();
    } catch (error) {
      // Rollback the transaction in case of any error
      await transaction.rollback();
      throw error;
    }
  }
}
