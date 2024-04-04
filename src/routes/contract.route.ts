import { Router } from 'express';
import { ContractController } from '@controllers/contract.controller';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';

export class ContractRoute implements Routes {
  public path = '/contracts';
  public router = Router();
  public contract = new ContractController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/:id`, AuthMiddleware, this.contract.getContractById);
  }
}
