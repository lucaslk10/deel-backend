import { Service } from 'typedi';
import { Contract, Job, Profile } from '@/models';
import { DB } from '@/database';
import { Op } from 'sequelize';

@Service()
export class AdminService {
  public async findBestProfession(start: string, end: string) {
    const [result] =
      (await Profile.findAll({
        attributes: ['profession', [DB.Sequelize.fn('SUM', DB.Sequelize.col('Contractor->Jobs.price')), 'totalEarnings']],
        include: [
          {
            model: Contract,
            as: 'Contractor',
            attributes: [],
            include: [
              {
                model: Job,
                as: 'Jobs',
                attributes: [],
                where: {
                  paid: true,
                  paymentDate: {
                    [Op.between]: [start, end],
                  },
                },
              },
            ],
          },
        ],
        group: ['Profile.profession'],
        order: [[DB.Sequelize.literal('totalEarnings'), 'DESC']],
        limit: 1,
        subQuery: false, // add this to handle limit+group properly
      })) || [];

    return result?.dataValues;
  }

  public async findBestClients(start: string, end: string, limit: number) {
    const topClients = await Profile.findAll({
      attributes: ['id', 'firstName', 'lastName', [DB.Sequelize.fn('SUM', DB.Sequelize.col('Client.Jobs.price')), 'totalSpent']],
      include: [
        {
          model: Contract,
          as: 'Client',
          attributes: [],
          include: [
            {
              model: Job,
              attributes: [],
              where: {
                paid: true,
                paymentDate: {
                  [Op.between]: [start, end],
                },
              },
            },
          ],
        },
      ],
      where: {
        type: 'client',
      },
      group: ['Profile.id'],
      order: [[DB.Sequelize.literal('totalSpent'), 'DESC']],
      limit: Number(limit),
      subQuery: false,
    });

    return topClients;
  }
}
