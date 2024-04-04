import { NextFunction, Request, Response } from 'express';
import { Container } from 'typedi';
import { JobService } from '@/services/jobs.service';

export class JobsController {
  public jobService = Container.get(JobService);

  public getUnpaidJobs = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const jobs = await this.jobService.getUnpaidJobs();
      res.status(200).json(jobs);
    } catch (error) {
      next(error);
    }
  };
}
