import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { BalanceController } from '@/controllers/balance.controller';
import { DepositAmountDto } from '@/dtos/deposit.dto';
import { ValidationMiddleware } from '@/middlewares/validation.middleware';

export class BalanceRoute implements Routes {
  public path = '/balances';
  public router = Router();
  public balanceController = new BalanceController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.post(`${this.path}/deposit/:userId`, AuthMiddleware, ValidationMiddleware(DepositAmountDto), this.balanceController.depositToUser);
  }
}
