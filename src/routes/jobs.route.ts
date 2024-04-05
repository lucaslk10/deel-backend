import { Router } from 'express';
import { Routes } from '@interfaces/routes.interface';
import { AuthMiddleware } from '@/middlewares/auth.middleware';
import { JobsController } from '@/controllers/jobs.controller';

export class JobRoute implements Routes {
  public path = '/jobs';
  public router = Router();
  public jobsController = new JobsController();

  constructor() {
    this.initializeRoutes();
  }

  private initializeRoutes() {
    this.router.get(`${this.path}/unpaid`, AuthMiddleware, this.jobsController.getUnpaidJobs);
    this.router.post(`${this.path}/:job_id/pay`, AuthMiddleware, this.jobsController.payForJob);
  }
}
