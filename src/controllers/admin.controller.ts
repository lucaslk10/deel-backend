import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { AdminService } from '@/services/admin.service';
import moment from 'moment';
export class AdminController {
  public adminService = Container.get(AdminService);

  public findBestProfession = async (req: Request, res: Response, next: NextFunction) => {
    try {
      let { start, end } = req.query;

      if (!start || !end) {
        return res.status(400).send({ message: 'Start and end dates are required.' });
      }

      // we may want to consider using utc times for dealing with different time zones
      start = moment(start as string, 'YYYY-MM-DD').format('YYYY-MM-DD');
      end = moment(end as string, 'YYYY-MM-DD').format('YYYY-MM-DD');

      const result = await this.adminService.findBestProfession(start as string, end as string);
      res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };
}
