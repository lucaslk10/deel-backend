import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { BalanceService } from '@/services/balance.service';

export class BalanceController {
  public balanceService = Container.get(BalanceService);

  public depositToUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const { amount } = req.body;
      await this.balanceService.depositToUser(amount, userId);
      res.status(200).json({ message: 'success' });
    } catch (error) {
      next(error);
    }
  };
}
