import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { AdminController } from '@/controllers/admin.controller';

export class AdminRoute implements Routes {
  public path = '/admin';
  public router = Router();
  public adminController = new AdminController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/best-profession`, AuthMiddleware, this.adminController.findBestProfession);
    // this.router.get(`${this.path}/best-clients`, AuthMiddleware, this.balanceController.bestClients);
  }
}
