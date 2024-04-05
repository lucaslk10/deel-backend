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
}
